import jwt from "jsonwebtoken";


export function generateToken(id, name,email, role){

    const token = jwt.sign(
        {id, name, email, role},
        process.env.SECRET_KEY,
        {expiresIn: process.env.EXPIRY}
    )

    return token

}