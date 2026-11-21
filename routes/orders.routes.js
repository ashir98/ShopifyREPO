import express from "express";
import { placeOrder } from "../controllers/order.controller";
import { protect } from "../middlewares/auth_middleware";
const orderRouter = express.Router();

orderRouter.route("/api/order/create")
.post(  protect  ,  placeOrder) // admin protected



export default orderRouter;