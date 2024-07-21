const User = require("../models/userModel");
const bcrypt = require('bcryptjs');
const generateTokenAndSetCookie = require("../utils/generateToken");
const register = async (req, res) => {
    try {

        const { email, username, password } = req.body;

        if (!email || !username || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            })
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email."
            })
        }

        if(password.length<6){
            return res.status(400).json({
                success: false,
                message: "Password length must be atleast 6."
            })
        }

        const existingEmail = await User.findOne({email})

        if(existingEmail){
            return res.status(400).json({
                success:false,
                message:"Email already exist."
            })
        }

        const existingUsername = await User.findOne({username})

        if(existingUsername){
            return res.status(400).json({
                success:false,
                message:"Username already exist."
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt) 

   
        const images = ["/p1.png","/p2.jpg","/p3.jpg","/p4.jpg","/p5.jpg"]

        const image = images[Math.floor(Math.random()*images.length)]

        const newUser = new User({
            email,
            username,
            password:hashedPassword,
            image


        })

        await newUser.save()
       
        generateTokenAndSetCookie(newUser._id,res);

        res.status(201).json({
            success:true,
            message:"Account created.",
            user:{
               username:newUser.username,
               email:newUser.email,
               image:newUser.image
            }
        })





    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email  || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            })
        }

        let user = await User.findOne({email})

        if(!user){
            return res.status(404).json({
                success: false,
                message: "Wrong email or password."
            })
        }

        const comparePassword = await bcrypt.compare(password,user.password)

        if(!comparePassword){
            return res.status(404).json({
                success: false,
                message: "Wrong email or password."
            })
        }

        generateTokenAndSetCookie(user._id,res);

        user = {
            username:user.username,
            email:user.email,
            image:user.image
        }

        res.status(200).json({
            success:true,
            message:`Welcome back ${user.username}`,
            user
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const logout = async (req, res) => {
    try {

        res.cookie('jwt','',{
            httpOnly:true,
            secure:true,
            sameSite:"none",
            maxAge:0
        }).json({
            success:true,
            message:"Logout successfull."
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


module.exports = {
    register,
    login,
    logout
}