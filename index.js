import express from "express";
import 'dotenv/config';
import cors from "cors";
import { errorHandler } from "./middlewares/error_handler.js";
import productRouter from "./routes/products.routes.js";
import userRouter from "./routes/users.routes.js";
import { connectDatabase } from "./config/db_config.js";
const app = express();
app.use(cors());
app.use(express.json());
// Har request se pehle DB connected hone ka intezar karo
app.use(async (req, res, next) => {
    try {
        await connectDatabase();
        next();
    } catch (error) {
        res.status(500).json({ message: `Database connection failed: ${error.message}` });
    }
});
app.use(userRouter);
app.use(productRouter);
app.use(errorHandler);

// Sirf local development me listen karo
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server is listening at port ${PORT}`));
}
// Vercel ke liye zaroori
export default app;
