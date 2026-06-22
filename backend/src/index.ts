import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { config } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { redis } from './config/redis';
import { logger } from './config/logger';
import { errorHandler, notFound } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';
import routes from './routes';

const app = express();
app.set('trust proxy', 1);

// Security
app.use(helmet());
const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:3000',
  'https://linguara-sigma.vercel.app',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      cb(null, true);
    } else {
      cb(new Error(`CORS: ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parsing
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Logging
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

// Rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api/v1', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

async function bootstrap() {
  try {
    await connectDatabase();
    logger.info(`✓ Redis: ${redis.status}`);

    const server = app.listen(config.port, () => {
      logger.info(`✓ Linguara API running on port ${config.port} [${config.env}]`);
    });

    const shutdown = async () => {
      logger.info('Shutting down...');
      server.close(async () => {
        await disconnectDatabase();
        await redis.quit();
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    logger.error('Bootstrap failed', { err });
    process.exit(1);
  }
}

bootstrap();
