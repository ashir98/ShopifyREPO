import express from "express";
const userRouter = express.Router();
import userController from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth_middleware.js";
import { upload } from "../config/multer.js";


userRouter.route("/api/register")
.post(userController.registerUser)

userRouter.route("/api/login")
.post(userController.loginUser)


userRouter.route("/api/forgot-password")
.post(userController.forgotPassword);


userRouter.route("/api/reset-password/:token")
.post(userController.resetPassword);


userRouter.route("/api/my-profile")
.get(  protect  ,  userController.getMyProfile)



userRouter.route("/api/upload-image")
.post( protect ,  upload.single('image'),  userController.uploadProfileImage );


export default userRouter;



