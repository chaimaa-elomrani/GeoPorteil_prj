const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) =>{
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if(!token){
            return res.status(401).json({
                success: false,
                message: "No token, authorization denied"
            });
        }

        // verification d token 
        const decode = jwt.verify(token , process.env.JWT_SECRET);
         
        // next step , verifying if the user exists 
        const user = await User.findOne({ _id: decode.id });
        if (!user){
            return res.status(401).json({
                success:false , 
                message: "User not found"
            });
        }

        req.user = user = {
            user: decode.userId, 
            email: decode.email, 
            role: decode.role 
        };
        next();
    }catch(err){

        console.error("error in the middleware auth", err);

        if(err.name === "TokenExpiredError"){
            return res.status(401).json({
                success: false,
                message: "Token expired"
            });
        }

        if(err.name === "JsonWebTokenError"){
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = authMiddleware;