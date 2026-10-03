import { UserModel } from "../models/users.model.js";
import bcrypt from "bcrypt"
import { generateToken } from "../utils/generateToken.js";


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
           const token = generateToken(userAccount._id, userAccount.name, userAccount.email, userAccount.role);

           const isPasswordCorrect = await bcrypt.compare(password , userAccount.password ) 

           if(isPasswordCorrect){
              res.status(200).json({
                success: true,
                message: "User Logged in Successfully!",
                token
              });
              
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



async function getMyProfile(req,res){

    const userData = req.user;

    res.status(200).json({
        success: true,
        userData
    })

}



export default{
    registerUser,
    loginUser,
    getMyProfile
}