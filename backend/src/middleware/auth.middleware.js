import jwt from 'jsonwebtoken';
import {db} from '../libs/db.js';

export const authMiddleware = async (req, res, next) => {
    
    const token = req.cookies.jwt;  
        if(!token){
            return res.status(401).json({message: "Unauthorized"});
        }
    let decoded;
    try{    
        decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user  = await db.user.findUnique({
            where:{
                id: decoded.id
            },
            select:{
                id: true,
                // Image: true,
                email: true,
                role: true,
                name: true,
            }
        });


        if (!user) {
            return res.status(404).json({message: "user not found"});
        }
        req.user = user;
        next();
    }catch(error){
        return res.status(401).json({message: "Invalid token"});
    }
    
}