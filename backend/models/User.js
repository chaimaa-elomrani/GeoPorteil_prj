const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({

   nom: {
        type: String,
        required: true,
        unique: false,
        trim: true,
    },

    prenom: {
        type: String,
        required: true,
        unique: false,
        trim: true,
    },
    
    
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    password: {
        type: String,
        required: false,
        minlength: 6,
    },

    role: {
        type: String,
        enum: ['client', 'admin', 'Directeur administratif', 'technicien', 'Directeur technique', 'Directeur générale',],
        default: 'client',
    },

    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    status:{
        type: String,
        enum: ['active', 'pending', 'blocked'],
        default: 'pending',
    },
    suspendedAt: Date,
    suspensionReason: String,
    suspensionEndDate: Date,

    createdAt: {
        type: Date,
        default: Date.now,
    },

    signupRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SignupRequest", 
    },

});


userSchema.pre('save', async function (next){
    if(!this.isModified('password')) return next();

    try{
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password , salt);
        next();
    }catch(error){
        next(error);
    }
});


userSchema.methods.comparePassword = async function (userPassword){
    return bcrypt.compare(userPassword, this.password);
};

userSchema.methods.toJSON = function(){
    const user = this.toObject();
    delete user.password;
    return user; 
};

const User = mongoose.model('User', userSchema);
module.exports = User; 