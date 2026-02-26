import pino from 'pino';
import path from 'path';
import 'pino-abstract-transport';
const pathLogs = path.join(process.cwd(), 'logs', 'app.log');
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = isDevelopment
    ? pino(pino.transport({
        targets: [
            {
                target: 'pino-pretty',
                level: 'debug',
                options: { colorize: true }
            },
            {
                target: 'pino/file',
                level: 'info',
                options: { destination: pathLogs, mkdir: true }
            }
        ]
    }))
    : pino({
        level: 'info',
    }, pino.destination({
        dest: pathLogs,
        mkdir: true,
        sync: false
    }));