import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user:  process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD
    }
});




export async function sendPasswordResetEmail(email, token ){

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    try {

        const resetEmail = {
            from: `Shopify Support ${process.env.SENDER_EMAIL}`,
            to: email,
            subject: "Reset Your Password",
            html: `
              <div>
                 <p>Click this link to reset your password</p>
                 <br/>
                 <a href=${resetLink}  >Click here</a>
              </div>
            `
        }

        await transporter.sendMail(resetEmail);
        

    } catch (error) {
        throw new Error("Failed to send email")
        
    }
    
}