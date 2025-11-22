import express, { type Request, type Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import authRoutes from './routes/auth.routes.js';
import alertRoutes from './routes/alert.routes.js';
import cryptoRoutes from './routes/crypto.routes.js';
import { initPriceMonitor } from './services/priceMonitor.js';

const app = express();
const port = process.env.PORT || 5000;
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/crypto', cryptoRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Crypto Alert API Server');
});

io.on('connection', (socket: any) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

initPriceMonitor(io);

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

