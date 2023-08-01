import { Schema } from "mongoose";
import mongoose from "mongoose";


const CommunityForumsSchema = new Schema({
    title: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },
    
    creator: {
        type: String,
        required: true,
    },

    comments: {
        type: Array,
        required: true,
    },

    upvotes: {
        type: Array,
        required: true,
    },

    downvotes: {
        type: Array,
        required: true,
    },

    locked: {
        type: Boolean,
        required: true,
    },

    lockedReason: {
        type: String,
        required: false,
    },
    
}, { timestamps: true });

export default mongoose.model("CommunityForums", CommunityForumsSchema);