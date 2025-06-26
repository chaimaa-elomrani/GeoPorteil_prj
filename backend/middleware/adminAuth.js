const jwt = require('jsonwebtoken'); 
const User = require('../models/User'); 


const adminAuth = async(req , res , next) => {
    try{
        console.log('checking admin auth'); 

        const  token = req.header('Authorization')?.replace('Bearer ', '');

        if(!token){
            return res.status(401).json({
                success:false,
                message: "access denied, no token provided" 
            }); 
        }

        const decoded =jwt.verify(token, process.env.JWT_SECRET); 

        const user = await User.findById(decoded.userId).select('-password');

        if(!user){
            return res.status(401).json({
                success:false,
                message: "User not found"
            });
        }

        if(user.role !== 'admin'){
            return res.status(403).json({
                success:false , 
                message: 'access denied , only admin is allowed to acces this page'
            });
        }

        req.user = user; 
        console.log(`admin authenticated: ${user.email}`); 
        next(); 
    }catch(err){
        console.error('error in admin auth middleware', err);
        res.status(500).json({
            success:false,
            message: 'Internal serverknv error'
        });
    }
};

module.exports = adminAuth;
