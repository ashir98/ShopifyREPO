import { OrderModel } from "../models/order.model";
import { ProductModel } from "../models/products.model";
import mongoose from "mongoose";




export async function placeOrder(req,res){ 
    
    // body se saari ordered items le lengy jo user ne di hain
    const {items} = req.body


    // check karo items array me hain? or khaali tw nhi hain? agar khaali hain tw order ni ban sakta
    if(!Array.isArray(items) || items.length === 0){
        res.status(400);
        throw new Error("Order must have atleast one item")
    }


    // ye array hum db me save krengy. isme har item verified details k sath hogi
    const orderItems = [] 
    
    // ye pury order ka total amount hold karega. shuruat me 0 rakhengy
    let totalAmount = 0;

    for(const item of items){

        if(!mongoose.Types.ObjectId.isValid(item.product)){
            res.status(400);
            throw new Error("Invalid Product ID")
        }

        const quantity = Number(item.quantity);

        if( !Number.isInteger(quantity) || quantity < 1  ){
            res.status(400)
            throw new Error("Quantity must be Integer and atleast 1")
        }


        const productData =  await ProductModel.findById(item.product);

        if(!productData){
            res.status(404);
            throw new Error("Item not available")
        }


        orderItems.push({
            product: productData._id,
            quantity,
            price: productData.price
        });

        totalAmount += productData.price * quantity;
    }



    // jab sab testing and verification hogai tw ab order ko place kardo
    const newOrder =  await OrderModel.create({
        user: req.user._id,
        items: orderItems,
        totalAmount
    });


    res.status(201).json({
        success: true,
        message: "Order placed!",
        order: newOrder
    })
}