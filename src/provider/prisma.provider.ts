import { PrismaClient } from '@/generated/prisma/client';
import { PrismaMssql } from '@prisma/adapter-mssql';

const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // database: process.env.DB_NAME,
    server: process.env.DB_HOST,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
}

const adapter = new PrismaMssql(sqlConfig)
const prisma = new PrismaClient({ adapter });

export default prisma;