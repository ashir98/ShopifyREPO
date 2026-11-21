import mongoose from "mongoose";


const orderSchema = mongoose.Schema({
    
    // fields
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },



    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Products",
                required: true
            },

            quantity: {
                type: Number,
                required: true,
                min: 1
            },

            price: {
                type: Number,
                required: true
            }

        }
    ],



    totalAmount: {
        type: Number,
        required: true
    },


    status: {
        type: String,
        enum: ["pending", "shipped", "delivered"],
        default: "pending"
    }

},  {timestamps: true}     );


export const OrderModel = mongoose.model("Orders", orderSchema);