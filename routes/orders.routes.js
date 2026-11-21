import express from "express";
import { placeOrder } from "../controllers/order.controller.js";
import { protect } from "../middlewares/auth_middleware.js";
const orderRouter = express.Router();

orderRouter.route("/api/order/create")
.post(  protect  ,  placeOrder) // admin protected



export default orderRouter;