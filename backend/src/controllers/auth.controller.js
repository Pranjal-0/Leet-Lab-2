import bcrypt from "bcryptjs";
import {db} from "../libs/db.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    const { username, email, password } = req.body;
    try{
        const existingUser = await db.user.findUnique({
            where: {
                email
            }
        });

        if(existingUser){
            return res.status(400).json({message: "User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.user.create({
            email,
            username,
            password: hashedPassword,
            role:UserRole.USER
        });

        const token = jwt.sign({ id: newUser.id}, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie("jwt",token,{
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user:{
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
                // image: newUser.image
            }
        })


    }catch(error){
        res.status(500).json({ message: "Error occurred while registering user" });
    }

    
};
export const login = async (req, res) => {
    const { email, password } = req.body;
    try{const user = await db.user.findUnique({
        where: {
            email
        }
    });    
    if(!user){
        return res.status(400).json({message: "User not found"});
    }
    const ismatch = await bcrypt.compare(password, user.password);     
    if(!ismatch)    {
        return res.status(400).json({message: "Invalid credentials"});
    }
    const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.cookie("jwt",token,{
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.status(201).json({
            message: "User logged in successfully",
            user:{
                id: newUser.id,
                username: user.username,
                email: user.email,
                role: user.role
                // image: newUser.image
            }
        })
    }catch(error){ 
        console.error("Error in loginning in",error);
        res.status(500).json({ message: "Error occurred while logging in" });   
    } 
}
export const logout = async (req, res) => {
    try{   
        res.clearCookie("jwt",{
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development"
        });
        res.status(200).json({
            success:true,
            message: "User logged out successfully"});

            

    }catch(error){
        console.error("Error in logging out",error);
        res.status(500).json({ message: "Error occurred while logging out" });
    }
    
}
export const check = async (req, res) => {
 
    try{
        res.status(200).json({
            success:true,
            message: "User authenticated successfully",
            user: req.user
        });
    }catch(error){   
        console.error("Error in checking user",error);
        res.status(500).json({ message: "Error occurred while checking user" });
        
    }

}