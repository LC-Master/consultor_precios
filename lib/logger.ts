import pino from 'pino';
import path from 'path'

const pathLogs = path.join(process.cwd(), 'logs', 'app.log');

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
    level: isDevelopment ? 'debug' : 'info',
}, pino.transport({
    targets: [
        ...(isDevelopment
            ? [
                {
                    target: 'pino-pretty',
                    level: 'debug',
                    options: { colorize: true }
                }
            ]
            : []),
        {
            target: 'pino/file',
            level: 'info',
            options: {
                destination: pathLogs,
                mkdir: true
            }
        }
    ]
}));