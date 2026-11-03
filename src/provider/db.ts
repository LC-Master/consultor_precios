import sql from "mssql";
import { logger } from "@/lib/logger";

export type ConnectionState = "CONNECTED" | "CONNECTING" | "DISCONNECTED";

const sqlConfig: sql.config = {
  user: process.env.DB_USER ?? "",
  password: process.env.DB_PASSWORD ?? "",
  server: process.env.DB_SERVER ?? process.env.DB_HOST ?? "localhost",
  database: process.env.DB_NAME ?? "",
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  connectionTimeout: 5000,
  requestTimeout: 15000,
};

export class DatabaseSupervisor {
  private pool: sql.ConnectionPool | null = null;
  private state: ConnectionState = "DISCONNECTED";
  private timer: NodeJS.Timeout | null = null;
  private attempt = 0;

  private readonly maxDelayMs = 30000;
  private readonly baseDelayMs = 1000;

  private constructor(private readonly config: sql.config) {
    if (process.env.NODE_ENV !== "test") {
      this.scheduleReconnect(0);
    }
  }

  public static getInstance(config: sql.config): DatabaseSupervisor {
    const globalForDb = globalThis as unknown as {
      _dbSupervisor?: DatabaseSupervisor;
    };

    if (!globalForDb._dbSupervisor) {
      globalForDb._dbSupervisor = new DatabaseSupervisor(config);
    }
    return globalForDb._dbSupervisor;
  }

  public getState(): ConnectionState {
    return this.state;
  }

  public async execute<T>(
    action: (pool: sql.ConnectionPool) => Promise<T>
  ): Promise<T> {
    if (this.state !== "CONNECTED" || !this.pool || !this.pool.connected) {
      throw new Error("DATABASE_UNAVAILABLE");
    }
    return await action(this.pool);
  }

  private async connect(): Promise<void> {
    this.state = "CONNECTING";

    try {
      const targetPool = new sql.ConnectionPool(this.config);

      targetPool.on("error", (err) => {
        logger.error("[MSSQL Pool Error]:", err?.message ?? err);
        this.handleFailure();
      });

      await targetPool.connect();
      await targetPool.request().query("SELECT 1");

      this.pool = targetPool;
      this.state = "CONNECTED";
      this.attempt = 0;

      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    } catch {
      this.handleFailure();
    }
  }

  private handleFailure(): void {
    this.state = "DISCONNECTED";

    if (this.pool) {
      this.pool.close().catch(() => { });
      this.pool = null;
    }

    this.attempt++;
    const exponential = Math.min(
      this.maxDelayMs,
      this.baseDelayMs * Math.pow(2, this.attempt)
    );
    const jitter = Math.random() * 1000;
    const delay = Math.round(exponential + jitter);

    this.scheduleReconnect(delay);
  }

  private scheduleReconnect(delayMs: number): void {
    if (this.timer) return;

    this.timer = setTimeout(() => {
      this.timer = null;
      this.connect();
    }, delayMs);

    if (this.timer && typeof this.timer.unref === "function") {
      this.timer.unref();
    }
  }
}

export const db = DatabaseSupervisor.getInstance(sqlConfig);
