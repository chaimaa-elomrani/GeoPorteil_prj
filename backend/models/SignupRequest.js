const mongoose = require("mongoose")

const signupRequestSchema = new mongoose.Schema({

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
    
      phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    requestDate: {
        type: Date,
        default: Date.now,
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    },
})

const SignupRequest = mongoose.model("SignupRequest", signupRequestSchema)

module.exports = SignupRequest