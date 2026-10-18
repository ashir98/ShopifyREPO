import { UserModel } from "../models/users.model.js";
import bcrypt from "bcrypt"
import { generateRefreshToken, generateToken, hashToken } from "../utils/generateToken.js";
import crypto from "crypto";
import { sendOTPMail, sendPasswordResetEmail } from "../utils/sendEmail.js";
import path from "path";
import { supabase } from "../config/supabase.js";
import jwt from "jsonwebtoken";

//=============================================
// REGISTER A USER ACCOUNT
//=============================================
async function registerUser(req, res, next) {
    try {
        // get all the data from the user
        const { name, email, password } = req.body;

        // check if all the fields are provided?
        if (!name || !email || !password) {
            res.status(400);
            throw new Error("Please provide all the details")
        }


        // check if the user is already registered?
        const userExist = await UserModel.findOne({email});



        if(userExist){
            res.status(400);
            throw new Error("This email is already registered!")
        }

        // agar user exist nhi karta pehle se
        else{


            // ab pehle password ko hash krengy
             const salt = await bcrypt.genSalt(10);
             const hashedPassword =  await bcrypt.hash(password,salt);


             // ab user ka data db me add kardo
             await UserModel.create({
                name,
                email,
                password: hashedPassword
             })


             res.status(201).json({
                success: true,
                message: "Account Created!"
             })
        }

    }
    catch (error) {
        res.status(400);
        next(error)
    }
}


//=============================================
// LOGIN USER ACCOUNT
//=============================================
async function loginUser(req, res, next) {

    try {
        // sab se pehle user se email and password
        const { email, password } = req.body;


        // check if all the fields are provided?
        if (!email || !password) {
            res.status(400);
            throw new Error("Please provide all the details")
        }



        // check karo k user ka account bana hua hai?
        const userAccount = await UserModel.findOne({email});


        // agr account nhi hai
        if(!userAccount){
            res.status(400);
            throw new Error("This email is not registered!")
        }

        // agar account hai?
        else{
           
           // token generate hogaya

           const isPasswordCorrect = await bcrypt.compare(password , userAccount.password ) 

           if(isPasswordCorrect){
             
              const otp = Math.floor(100000 + Math.random() * 900000);
              const otpExpires = Date.now() + (5*60*1000);

            await  UserModel.updateOne(
                {_id:  userAccount._id},
                {otp, otpExpires}
            )

            try {
                await sendOTPMail(userAccount.email, otp);
            } catch (error) {
                await UserModel.updateOne(
                    {_id: userAccount._id},
                    {otp: null, otpExpires: null}
                )
                res.status(500);
                throw new Error("Unable to send OTP at the moment, Please try again")
            }

            res.status(200).json({
                success: true,
                message: "OTP is sent to your email. Please check"
            })

              
           }else{
              res.status(400);
              throw new Error("Incorrect Password");
           }
        }






    } catch (error) {
        res.status(400);
        next(error);
    }
}


//=============================================
// GET MY PROFILE
//=============================================
async function getMyProfile(req,res){

    const userData = req.user;

    res.status(200).json({
        success: true,
        userData
    })

}


//=============================================
// FORGOT PASSWORD
//=============================================
async function forgotPassword(req,res,next){
    try {
        
        const {email} = req.body;

        if(!email){
            res.status(400);
            throw new Error("Please provide email")
        }



        const userRecord = await UserModel.findOne({email});


        if(!userRecord){
            res.status(200).json({
                success: true,
                message: "If your email is registered, you will receive an email!"
            })
        }


        // agar user hai tw token banaynge
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpires = Date.now() + 600000;

        userRecord.resetToken = resetToken;
        userRecord.resetTokenExpires = resetTokenExpires;
        userRecord.save();


        try {
            await sendPasswordResetEmail(email,resetToken);
            res.status(200).json({
                success: true,
                message: "If your email is registered, you will receive an email!"
            })
        } catch (error) {
            userRecord.resetToken = null;
            userRecord.resetTokenExpires = null;
            userRecord.save();
            res.status(500); // server error\
            throw new Error("Unable to send email at the moment, please try again later")
        }

    } catch (error) {
        next(error);
    }
}



//=============================================
// RESET PASSWORD
//=============================================
async function resetPassword(req,res,next){

    try {
        
        const {token} = req.params;
        const {newPassword, confirmPassword} = req.body;


        if(!token){
            res.status(400);
            throw new Error("Invalid or expired Link");
        }


        if(!newPassword || !confirmPassword){
            res.status(400);
            throw new Error("Please provide both passwords")
        }


        if(newPassword.trim()  !== confirmPassword.trim()  ){
            res.status(400);
            throw new Error("Password does not match");
        }

        if(newPassword.trim().length < 6  ){
            res.status(400);
            throw new Error("Password should be atleast 6 digits long");
        }


        const userRecord = await UserModel.findOne({
            resetToken: token,  // TRUE
            resetTokenExpires: {$gt : Date.now() } // TRUE
        })


        if(!userRecord){
            res.status(400);
            throw new Error("Invalid or Expired Link")
        }


        // ab pehle password ko hash krengy
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword =  await bcrypt.hash(newPassword,salt);

        userRecord.password = newHashedPassword;
        userRecord.resetToken = null;
        userRecord.resetTokenExpires = null;
        userRecord.save();


        res.status(200).json({
            success: true,
            message: "Password has been changed. You can now login with new password!"
        })

    } catch (error) {
        next(error);
    }
}




//=============================================
// UPLOAD USER PROFILE IMAGE
//=============================================
async function uploadProfileImage(req,res,next){
    try {

        if(!req.file){
            res.status(400);
            throw new Error("Please select an image first");
        }

        
        const extension = path.extname(req.file.originalname);
        const fileName = "shopify_" + Date.now() + extension;


        // data bhejdo supbase pe
        const result = await supabase.storage
        .from(process.env.BUCKET)
        .upload(fileName, req.file.buffer ,  { contentType: req.file.mimetype }  );

        const uploadError = result.error;

        if(uploadError){
            res.status(500);
            throw new Error("Image Upload failed, Please try again!");
        };


        const urlResult = supabase.storage.from(process.env.BUCKET).getPublicUrl(fileName);
        const userRecord = await UserModel.findById(req.user._id);
        userRecord.profileImage = urlResult.data.publicUrl
        await userRecord.save();



        // success result send kardo
        res.status(200).json({
            success: true,
            message: "Image Uploaded",
            imageUrl : urlResult.data.publicUrl
        })

    } catch (error) {
        next(error)
    }
}


//=============================================
// REFRESH ACCESS TOKEN 
//=============================================
async function refreshAccessToken(req,res,next){

    try {
        
        // token lena hai user se refresh token
        const {refreshToken} = req.body;


        // check karo token aya hai bhi ya nhi
        if(!refreshToken){
            res.status(401);
            throw new Error("Refresh token is required")
        }

        // agar hai refresh token phir?
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
        } catch (error) {
            res.status(401);
            throw new Error("Invalid or expired refresh token");
        }


        const userRecord = await UserModel.findById(decoded.id);

        if(!userRecord){
            res.status(401);
            throw new Error("User no longer exist");
        }

        const newRefreshToken =  generateRefreshToken(userRecord._id);
        const hashedRefreshToken = hashToken(newRefreshToken); // ye new refresh access toen hai


        const matchedUser = await UserModel.findOneAndUpdate(
            {_id: userRecord._id,  refreshToken: hashToken(refreshToken)}, // ye filter hai 
            {refreshToken: hashedRefreshToken}
        )

        if(!matchedUser){
            await UserModel.updateOne( {_id: userRecord._id} ,  {refreshToken: null} )
            res.status(401);
            throw new Error("Something went wrong, Please login again");
        }


        // naya access token banaow
        const token =  generateToken( userRecord._id, userRecord.name, userRecord.email, userRecord.role  );        

        // response bhejo
        res.status(200).json({
            success: true,
            token,
            refreshToken: newRefreshToken
        })




    } catch (error) {
        next(error)
    }

}



//=============================================
// LOGOUT (refresh token ko delete kar dengy)
//=============================================
async function logout(req,res,next){
    try {
        
        const {refreshToken} = req.body;

        if(refreshToken){
            await UserModel.updateOne(  { refreshToken: hashToken(refreshToken) } ,  { refreshToken: null } )
        }

        res.status(200).json({
            success: true,
            message: "Logout success!"
        })

    } catch (error) {
        next(error)
    }
}



//=============================================
// VERIFY OTP
//=============================================
async function verifyOTP (req,res,next){

    try {

        const {email,otp } = req.body

        if(!email || !otp){
            res.status(400);
            throw new Error("Please provide email and OTP")
        }


        const userRecord = await UserModel.findOne({email}).select("+otp +otpExpires")
        


        if(!userRecord){
            res.status(400);
            throw new Error("Email not registered")
        }


        if(!userRecord.otp || userRecord.otp !== otp){
            res.status(400);
            throw new Error("Incorrect OTP")
        }


        if(!userRecord.otpExpires  || userRecord.otpExpires < Date.now()){
            throw new Error("OTP Expired, Please login again")
        }


        const token = generateToken(userRecord._id, userRecord.name, userRecord.email, userRecord.role);
        const refreshToken = generateRefreshToken(userRecord._id);
        
        userRecord.refreshTokenHash = hashToken(refreshToken);

        userRecord.otp = null;
        userRecord.otpExpires = null;

        await userRecord.save();


        res.status(200).json({
            success: true,
            message: "OTP Verified, Logged in successfully",
            token,
            refreshToken
        })

    } catch (error) {
        next(error)
    }
}


export default{
    registerUser,
    loginUser,
    getMyProfile,
    forgotPassword,
    resetPassword,
    uploadProfileImage,
    refreshAccessToken,
    logout,
    verifyOTP
}