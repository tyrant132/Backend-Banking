import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js'
const app = express();
app.use(express.json())
app.use(cookieParser())

app.use('/api/authen',authRouter);

export default app;