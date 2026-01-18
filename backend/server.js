import express from "express";
import dotenv from 'dotenv';
import restaurantRouter from "./routes/restaurantRouter.js";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js"
dotenv.config();

const app = express();
const PORT = process.env.PORT


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())

app.use('/api', restaurantRouter);

app.get('/', (req, res) => {
    res.send('Hello from the server');
})


app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
})


