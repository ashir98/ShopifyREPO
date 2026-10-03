import express from "express";
const productRouter = express.Router();
import productController from "../controllers/product.controller.js";


productRouter.route("/")
.get(productController.getAllProducts)
.post(productController.addProduct)


productRouter.route("/:id")
.get(productController.getSingleProduct)
.put(productController.updateProduct)



export default productRouter;



