import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import routes from './routes';
import connectDB from './config/db'; // Import connectDB
import authRoutes from './routes/authRoutes'; // Import authRoutes
import path from 'path'; // Import path
import helmet from 'helmet'; // Import helmet
import rateLimit from 'express-rate-limit'; // Import express-rate-limit
import errorHandler from './middleware/errorMiddleware'; // Import error handler
import logger from './utils/logger'; // Import logger
import swaggerUi from 'swagger-ui-express'; // Import swagger-ui-express
import fs from 'fs'; // Import fs
import yaml from 'js-yaml'; // Import yaml

// Connect to database
connectDB();

const app: Application = express();
const port = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet()); // Set security headers
app.use(cors({
  origin: 'https://shastikfashion.vercel.app',
  credentials: true,
}));
// app.options('*', cors());
// app.use(options('*', cors()));
// app.use(cors()); // Enable CORS

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
// app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use(logger);
app.use((req, res, next) => {
  // Handle Lambda body types
  if (req.body) {
    // 1. If it's a string, try parsing it
    if (typeof req.body === 'string') {
      try {
        req.body = JSON.parse(req.body);
      } catch {
        // Not JSON string or already parsed partially, ignore
      }
    }
    // 2. If it's a Buffer object, convert to string and parse
    else if (Buffer.isBuffer(req.body)) {
      try {
        req.body = JSON.parse(req.body.toString());
      } catch {
        // Not JSON
      }
    }
    // 3. If it's the JSON representation of a Buffer: { type: "Buffer", data: [...] }
    else if (typeof req.body === 'object' && (req.body as any).type === 'Buffer' && Array.isArray((req.body as any).data)) {
      try {
        const buffer = Buffer.from((req.body as any).data);
        req.body = JSON.parse(buffer.toString());
      } catch {
        // Not JSON
      }
    }
  }

  // Also check the apiGateway event if body is still empty
  if (process.env.AWS_LAMBDA_FUNCTION_NAME && (!req.body || (typeof req.body === 'object' && Object.keys(req.body).length === 0))) {
    const event = (req as any).apiGateway?.event;
    if (event?.body) {
      let body = event.body;
      if (event.isBase64Encoded) {
        body = Buffer.from(body, 'base64').toString('utf8');
      }
      try {
        req.body = JSON.parse(body);
      } catch (e) {
        // Not JSON
      }
    }
  }

  console.log('Lambda Request Body type:', typeof req.body);
  console.log('Lambda Request Body:', JSON.stringify(req.body));
  next();
});

// app.use((req, res, next) => {
//   if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
//     console.log('Lambda Request Path:', req.path);
//     console.log('Lambda Request Body type:', typeof req.body);
//     console.log('Lambda Request Body:', JSON.stringify(req.body));
//   }
//   next();
// });

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Serve static files

// Swagger API Docs
// swagger.yaml lives in the project root (one level above `src`), so use '../swagger.yaml'
const swaggerDocument = yaml.load(fs.readFileSync(path.resolve(__dirname, '../swagger.yaml'), 'utf8')) as Record<string, any>;
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', routes);
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Shastik Fashion Backend');
});

// Error handling middleware
app.use(errorHandler);

// Only listen when running as a standalone server, not when deployed to Lambda
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;