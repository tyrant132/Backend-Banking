import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js'
import accountRouter from './routes/accounts.routes.js'
import transactionRouter from './routes/transaction.routes.js'


const app = express();
app.use(express.json())
app.use(cookieParser())

/**
 * -Use Routes
 */

app.get("/", (req,res) => {
  res.send("Ledger Service is up and running")
})


app.use('/api/auth',authRouter);
app.use('/api/accounts',accountRouter);
app.use('/api/transactions',transactionRouter);


export default app;