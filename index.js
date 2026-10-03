import express from "express";
import 'dotenv/config';
import { errorHandler } from "./middlewares/error_handler.js";
import productRouter from "./routes/products.routes.js";
import userRouter from "./routes/users.routes.js";
import { connectDatabase } from "./config/db_config.js";
const app = express();
app.use(express.json());
connectDatabase();



//MIDDLEWARE CALLING
app.use("/api/products",  productRouter   );
app.use(userRouter);


app.use(errorHandler)


app.listen(   process.env.PORT,   ()=>{  console.log(`Server is running at ${process.env.PORT}`)   }    )