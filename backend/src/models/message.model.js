import { text } from "express";
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, 
    },
    receiverID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, 
    },
    text: {
        type: String,
        required: true,
    },
    image:{
        type: String,
    },
    timestamps: {
        type: Date,
        default: Date.now,
    },
});

const message = mongoose.model("Message", messageSchema);

export default message;