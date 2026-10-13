import mongoose from "mongoose";
const userSchema = mongoose.Schema({

    // fields
    name: {
        type: String,
        required: [true, "Name is required"]
    },


    email: {
        type: String,
        unique : [true, "Email should be unique"],
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, "Email should have valid format"]
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
        // match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/]
        minLength: 6
    },


    profileImage: {
        type: String,
        default: ""
    },


    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },


    resetToken: {
        type: String,
        default: null
    },

    resetTokenExpires: {
        type: Date,
        default: null
    }

}, {timeStamps: true});



export const UserModel = mongoose.model("Users",  userSchema );


