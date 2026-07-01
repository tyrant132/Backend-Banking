import app from "./src/app.js";
import 'dotenv/config';
import connectDB from "./src/config/db.js";
connectDB();
const PORT = 3000;
app.listen(PORT, ()=>{
  console.log(`The server is running on ${PORT}`);
})