import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import locationRoutes from './routes/location.routes.js';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));


app.use('/location', locationRoutes);

export default app;