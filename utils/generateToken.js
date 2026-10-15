import jwt from "jsonwebtoken";
import crypto from "crypto";


export function generateToken(id, name,email, role){

    const token = jwt.sign(
        {id, name, email, role},
        process.env.SECRET_KEY,
        {expiresIn: process.env.EXPIRY}
    )

    return token

}


export function generateRefreshToken(id){
    const token = jwt.sign(
        {id},
        process.env.REFRESH_SECRET_KEY,
        {expiresIn: process.env.REFRESH_EXPIRY}
    )
    return token
}



export function hashToken(token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return hashedToken;
}