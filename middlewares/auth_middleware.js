import jwt from "jsonwebtoken";
import { UserModel } from "../models/users.model.js";



export async function protect(req,res,next){

    // variable jis me token aayega
    let token;


    // check karo k user ne token pass kiya hai req me or kya uska format thekk hai?
    const authorizationHeader = req.headers.authorization;

    if(authorizationHeader && authorizationHeader.startsWith("Bearer")){
        token = authorizationHeader.split(" ")[1];
    }


    if(!token){
        res.status(401);
        throw new Error("Not authorized to access this route");
    }



    try {

        const decryptedToken = jwt.verify(token , process.env.SECRET_KEY );

        const userInfo = await UserModel.findById(decryptedToken.id).select('-password -resetToken -resetTokenExpires');

        if (!userInfo) {
            res.status(401);
            throw new Error('User account not found');
        }

        req.user = userInfo;

        next();
        
    } 
    
    catch (error) {
        res.status(401);
        next(error)
    }



}
