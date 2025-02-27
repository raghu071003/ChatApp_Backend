import mongoose from "mongoose";
import { User } from "../Models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { options } from "../constants.js";

const generateTokens =async (userId)=>{
    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(500,"Something Went Wrong")
    }
    try {
        const accessToken =  user.generateAccessToken()
        const refreshToken =  user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:true})
        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(400,error?.message || "Invalid Request")
    }
}

const userLogin = async(req,res)=>{
    // console.log(req.body);
    
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(!user){
        throw new Error("No user FOund!");
    }
    const isValid = user.isValidPassword(password)
    if(!isValid){
        throw new ApiError(401,"Invalid Password")
    }
    const {accessToken,refreshToken} =  await generateTokens(user._id);
    console.log("x");

    res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
        new ApiResponse(200, "Logged in successfully",)
    )
    
}
const userRegister = async(req,res)=>{
    // console.log(req.body);
    const {email,fullName,password} = req.body;
    const Existinguser = await User.findOne({email});
    if(Existinguser){
        throw new ApiError(401,"User Aldready Exists!!")
    }
    const user = await User.create({
        email:email,
        fullName:fullName,
        password:password,
    })
    
}

export {userLogin,userRegister}