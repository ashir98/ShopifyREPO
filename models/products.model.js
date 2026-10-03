import mongoose from "mongoose";


const productSchema = mongoose.Schema({
    
    // fields
    title: {
        type: String,
        required: [true,  "Title is required"],
        trim: true,
        minlength: 3
    },


    price: {
        type: Number,
        required: [true, "price is required"],
        // min: 10,
        max: 1000000,
    },

    category: {
        type: String,
        enum: ["Clothing", "Groccery", "Electronics", "Food", "FootWear", "All"],
        default: "All",
        trim: true
    },


    desc: {
        type: String,
        required: [true, "Description is required"]
    },

    imgUrl: {
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWBnkK-wGsErhBvACARIWaphtic6273yUQVHYfk3N5uMum4v0GNiPFOcbj&s=10"
    }
},  {timestamps: true}     );


export const ProductModel = mongoose.model("Products", productSchema);