import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"


export const signup = async (req,res) => {
    // res.send("Signup route")
    console.log("Signup route is hit");
    const {fullname,email,password} =req.body
    try {
        if(!password || !fullname || !email)
        {
            return res.status(400).json({message: "Fill all the field completely"});
        }
        if (password.length<6) {
            return res.status(400).json({message: "Password must be at least 6 characters"});
        }
        const user = await User.findOne({email}); // checks if the email already exist in the database
        if (user) return res.status(400).json({message: "Email already Exist"});

        // now encrypting the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            fullname,
            email,
            password: hashedPassword,
        });

        if(newUser)
        {
            // generate jwt token here
            generateToken(newUser._id,res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                profilepic: newUser.profilepic || "",
            });
        }
        else{
            res.status(400).json({message: " Invalid User Data"})
        }
    } catch (error) {
        console.log("Error in signup control",error);
        res.status(500).json({message:"Internal Server Error"});
    }
};
export const login = async (req,res) => {
    const { email, password } = req.body 
    try {
        const user =  await User.findOne({email});

        if (!user)
        {
            return res.status(400).json({message: "Invalid Email or Password"});
        }

        const isPasswordCorrect = await bcrypt.compare(password,user.password);
        if (!isPasswordCorrect){
            return res.status(400).json({message: "Invalid Email or Password"});
        }
        // generate jwt token here
        generateToken(user._id,res);
        res.status(200).json({
            _id:user._id,
            fullname: user.fullname,
            email: user.email,
            profilepic: user.profilepic,
        });
    } catch (error) {
        console.log("Error in Login Contrtoller",error.message);
        res.status(500).jspn({message:"Internal Server Error"});
    }
};
export const logout = (req,res) => {
    try {
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({ message : "Logged Out Succesfully"});
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"});
        
    }
};
export const updateProfile = async (req,res) =>{
    console.log("Request body:", req.body);
    console.log("Received profilepic in auth controller:");
    try {
        const {profilepic} = req.body;
        // console.log("Received profilepic:", profilepic);
        console.log("Processing profilepic:");
        const userId=req.user._id;
        // console.log("Request body:", req.body);
        console.log("Request body of image");
        if(!profilepic)
        {
            return res.status(400).json({message:"Please provide an image"});
        }

        const uploadResponse = await cloudinary.uploader.upload(profilepic,{
            upload_preset: "social_media",
            resource_type: "image",
        });

        const updatedUser = await User.findByIdAndUpdate(userId,{profilepic:uploadResponse.secure_url},{new:true});
        res.status(200).json({updatedUser});

    } catch (error) {
        console.log("Error in updateProfile controller",error);
        // console.log("Request body:", req.body);
        res.status(500).json({message:"Internal Server Error"});
    }
};
// this function is meant for the case when the page is refreshed and the user is still logged in
export const checkAuth = (req,res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
};