import express from "express";
const userRouter = express.Router();
import userController from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth_middleware.js";


userRouter.route("/api/register")
.post(userController.registerUser)

userRouter.route("/api/login")
.post(userController.loginUser)


userRouter.route("/api/my-profile")
.get(  protect  ,  userController.getMyProfile)



export default userRouter;



