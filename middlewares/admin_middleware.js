import jwt from "jsonwebtoken";
import { UserModel } from "../models/users.model.js";


export async function adminProtect(req,res,next){

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

        const userInfo = await UserModel.findById(decryptedToken.id).select("-password");

        if(!userInfo){
            res.status(401);
            throw new Error("Not authorized.");
        }

        if (userInfo.role !== "admin") {
            res.status(401);
            throw new Error("Access denied. only admin can access");
        }
        else{
            req.user = userInfo;
            next();
        }
        
    } 
    
    catch (error) {
        res.status(401);
        next(error)
    }



}