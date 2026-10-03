import { ProductModel } from "../models/products.model.js";
import mongoose from "mongoose"



//=============================================
// GET ALL PRODUCTS
//=============================================
async function getAllProducts(req,res){
    const allProducts =  await ProductModel.find();
    res.status(200).json(allProducts)
}





//=============================================
// GET A SINGLE PRODUCTS
//=============================================
async function getSingleProduct(req,res){
    
    // get the id
    const productID = req.params.id;

    // verify the id
    if(!mongoose.Types.ObjectId.isValid(productID)){
        res.status(400);
        throw new Error("Invalid Product ID");
    }

    // ab is id k behalf pe product ko find karo
    const productData = await ProductModel.findById(productID);

    // lekin check karo k agar prouct na mila phir?
    if(!productData){
        res.status(404);
        throw new Error("Product Data Not Found!")
    }

    // or agar procuct available tha?
    else{
        res.status(200).json({
            success: true,
            data: productData
        })
    }
}









//=============================================
// ADD A PRODUCT
//=============================================
async function addProduct(req,res){

    const {title, price, category, desc, imgUrl} = req.body;

    // check karo fields provide ki hain?
    if (!title  || !price || !desc ) {
        res.status(400);
        throw new Error("Title, Price and Desc are required fields")
    }

    // agar data diya hai tw ab data ko prepare karo add karne k lye
    const productData = {
        title,price,category, desc,imgUrl
    }


    // model ab apka data mongodb me add karega
    await ProductModel.create(productData);


    // ab user ko response de do k data add hogaya
    res.status(200).json({
        success: true,
        message: "Product Added Successfully!"
    })
}




//=============================================
// UPDATE A PRODUCT
//=============================================
async function updateProduct(req,res){
    
    // id le ke aaow
    const id = req.params.id;


    // data laow jo update karna hai
    const updatedData = req.body;


    // ab hum db me values ko update krengy
    const updatedProduct = await ProductModel.findByIdAndUpdate(
        id, updatedData, {new: true}
    );


    // response send krengy user ko k product update hogaya
    res.status(200).json({
        success: true,
        message: "Product Updated!",
        updatedProduct
    })
}










export default {
    getAllProducts,
    addProduct,
    getSingleProduct,
    updateProduct
}