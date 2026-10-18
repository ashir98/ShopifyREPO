import express from "express";
const userRouter = express.Router();
import userController from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth_middleware.js";
import { upload } from "../config/multer.js";
import { loginLimiter } from "../middlewares/rate-limiter.js";

userRouter.route("/api/register")
.post(userController.registerUser)

userRouter.route("/api/login")
.post( loginLimiter  , userController.loginUser)

userRouter.route("/api/verify-otp")
.post( loginLimiter  , userController.verifyOTP)

userRouter.route("/api/logout")
.post(userController.logout)


userRouter.route("/api/refresh")
.post(userController.refreshAccessToken)


userRouter.route("/api/forgot-password")
.post(userController.forgotPassword);


userRouter.route("/api/reset-password/:token")
.post(userController.resetPassword);


userRouter.route("/api/my-profile")
.get(  protect  ,  userController.getMyProfile)



userRouter.route("/api/upload-image")
.post( protect ,  upload.single('image'),  userController.uploadProfileImage );


export default userRouter;



