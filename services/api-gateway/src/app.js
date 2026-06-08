import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import locationRoutes from './routes/location.routes.js';
import triageRoutes from './routes/triage.routes.js';
import pulseOpsRoutes from './routes/pulseops.routes.js';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));


app.use('/location', locationRoutes);
app.use('/pulse-triage', triageRoutes);
app.use('/pulse-ops', pulseOpsRoutes);

export default app;