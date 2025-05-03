import mongoose from "mongoose";
import { User } from "../Models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { options } from "../constants.js";
import { Chat } from "../Models/chat.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
    const {accessToken,refreshToken} =  await generateTokens(user._id)
    res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
        new ApiResponse("200",)
    )
    
}
const userRegister = async (req, res) => {
    try {
        const { email, fullName, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(401).json(new ApiError(401, "User Already Exists!"));
        }

        // Create new user
        const user = await User.create({
            email,
            fullName,
            password,
        });

        // Respond with success message
        return res.status(201).json(new ApiResponse(201, { userId: user._id }, "Welcome to the future of seamless and modern communication!"));

    } catch (error) {
        console.error("Error in user registration:", error);
        return res.status(500).json(new ApiError(500, "Internal Server Error"));
    }
};
const userLogout = async (req, res) => {
    try {
        await User.findOneAndUpdate(
            { _id: req.user._id },
            { refreshToken: undefined },
            { new: true }
        );
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true, // only if you're using HTTPS
            sameSite: 'Strict'
        });
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: true, // only if you're using HTTPS
            sameSite: 'Strict'
        });
        
        return res.status(201).json({ message: 'Logout successful' });
    } catch (error) {
        console.log(error);
        return res.status(404).json({ error: 'Logout failed' });
    }
};


const getUser = async(req,res)=>{
    try {
        res.status(200).json({ success: true, user: req.user });
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
}
const addContact = async(req,res)=>{
    const { contactId } = req.body;
    const userId = req.user._id;

    if (!userId || !contactId) {
        return res.status(400).json({ message: "User ID and Contact ID are required" });
    }

    try {
        await User.findByIdAndUpdate(userId, { $addToSet: { contacts: contactId } });
        await User.findByIdAndUpdate(contactId, { $addToSet: { contacts: userId } });

        res.status(200).json({ message: "Contact added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error adding contact", error });
    }
}

const getContacts = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) {
            return res.status(401).json({ error: "Invalid User" });
        }

        // Fix: Pass only the userId, not an object
        const user = await User.findById(userId).populate("contacts", "fullName profileImg email");
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ contacts: user.contacts, message: "Contacts Fetched Successfully" });
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const getUsers = async(req,res)=>{
    try {
        const { query } = req.query;
        
        const users = await User.find({
            $or: [
                { fullName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } }
            ]
        }).select("fullName profileImg email");

        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ error: "Error searching users" });
    }
}

const getChats = async (req, res) => {
    try {
        const userId = req.user._id;
        
        if (!userId) {
            return res.status(401).json({ error: "Invalid User" });
        }

        // Find all chats where the user is a member
        const chats = await Chat.find({ members: userId })
            .populate("members", "fullName profileImg email") // Fetch user details
            .populate("lastMessage.sender", "fullName profileImg") // Fetch sender details for the last message
            .sort({ updatedAt: -1 }); // Sort by latest activity

        
        return res.status(200).json({ chats });
    } catch (error) {
        console.error("Error fetching chats:", error);
        return res.status(500).json({ error: "Failed to fetch chats" });
    }
};

const getChat = async (req, res) => {
    try {
        const { activeChat, page = 1, limit = 20 } = req.body;
        const loggedInUserId = req.user._id;

        // Find chat where both users are members
        const chat = await Chat.findOne({
            members: { $all: [loggedInUserId, activeChat] },
        }).populate("messages.sender", "name profileImg"); // Populate sender details

        if (!chat) {
            return res.status(400).json({ message: "Chat not found" });
        }

        const totalMessages = chat.messages.length;
        const startIndex = Math.max(0, totalMessages - page * limit);
        const endIndex = totalMessages - (page - 1) * limit;

        const paginatedMessages = chat.messages.slice(startIndex, endIndex);

        res.status(200).json({ messages: paginatedMessages, totalMessages });
    } catch (error) {
        console.error("Error fetching chat:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const uploadPicture = async(req,res)=>{
    const userId = req.user._id;
    
    if(!userId){
        return new ApiError(402,"Invalid User");
    }
    
    
    const localPath = req.file.path;
    // console.log(localPath);
    
    const uploadOnCloud = await uploadOnCloudinary(localPath);
    
    
    try {
        await User.findOneAndUpdate(
            userId,
            {
                profileImg:uploadOnCloud.url
            },{
                new:true
            }
        )
    } catch (error) {
        console.log(error);
        
        return res.status(404);
    }
    return res.status(200).json({message:"Updated!"})
    
}
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey:"AIzaSyDJ4-17Ci-OB-Y2nUzdf5W3pPyedNLQLs4"});

async function enhanceText(req, res) {
    try {
      const message = "Hi ra ela unnav😁"; // You can later get this from req.body.message
      const prompt = `Improve the clarity and grammar of this user message while keeping the meaning the same: "${message}"`;
  
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); // or "gemini-pro" if preferred
  
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const improvedText = response.text();
  
    //   console.log(improvedText);
  
      res.json({ original: message, improved: improvedText });
    } catch (error) {
      console.error("Error enhancing text:", error);
      res.status(500).json({ error: "Failed to enhance text." });
    }
  }




export {userLogin,userRegister,getUser,userLogout,addContact,getContacts,getUsers,getChats,getChat,uploadPicture}