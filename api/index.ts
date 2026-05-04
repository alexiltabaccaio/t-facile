import express from 'express';
import { configureApiRoutes } from '../server/appConfig.js';

const app = express();

// Configure shared API routes and middleware
configureApiRoutes(app);

// On Vercel, this file exports the app as a serverless handler function
export default app;
