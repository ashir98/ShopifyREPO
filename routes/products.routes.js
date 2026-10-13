import express from "express";
const productRouter = express.Router();
import productController from "../controllers/product.controller.js";
import { adminProtect } from "../middlewares/admin_middleware.js";


productRouter.route("/")
.get(productController.getAllProducts)
.post(  adminProtect   , productController.addProduct) // admin protected


productRouter.route("/:id")
.get(productController.getSingleProduct)
.put( adminProtect  , productController.updateProduct) // admin protected



export default productRouter;



