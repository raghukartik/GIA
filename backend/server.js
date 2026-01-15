import express from "express";
import dotenv from 'dotenv';
import restaurantRouter from "./routes/restaurantRouter.js";
import pool from "./models/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT

app.use('/api', restaurantRouter);

app.get('/', (req, res) => {
    res.send('Hello from the server');
})


app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
})


