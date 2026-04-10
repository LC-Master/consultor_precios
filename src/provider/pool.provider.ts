export const dynamic = 'force-dynamic';

import sql from "mssql";

export const pool = sql.connect({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || "1433"),
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
})