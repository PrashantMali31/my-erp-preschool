import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { connectDB } from './config/database';
import { env, isProduction } from './config/env';
import { authRouter } from './routes/auth';
import { studentsRouter } from './routes/students';
import { teachersRouter } from './routes/teachers';
import { attendanceRouter } from './routes/attendance';
import { feesRouter } from './routes/fees';
import { announcementsRouter } from './routes/announcements';
import { dashboardRouter } from './routes/dashboard';
import { classesRouter } from './routes/classes';
import { settingsRouter } from './routes/settings';
import { reportsRouter } from './routes/reports';
import { errorHandler } from './middleware/errorHandler';
import { sanitize } from './middleware/sanitization';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Triggering restart for env change
const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.options('*', cors());

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: isProduction ? undefined : false,
}));

app.use(compression());

const limiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS),
  max: parseInt(env.RATE_LIMIT_MAX),
  message: { status: 'error', message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use(morgan(isProduction ? 'combined' : 'dev'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitize);

app.use('/api/auth', authRouter);
app.use('/api/students', studentsRouter);
app.use('/api/teachers', teachersRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/fees', feesRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/classes', classesRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/reports', reportsRouter);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

let server: ReturnType<typeof app.listen>;

const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 30000);
};

const startServer = async () => {
  try {
    await connectDB();
    
    server = app.listen(parseInt(env.PORT), () => {
      console.log(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app };
