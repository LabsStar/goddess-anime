import { Schema } from "mongoose";
import mongoose from "mongoose";


const BadgesSchema = new Schema({
    name: {
        type: String,
        required: false,
    },

    description: {
        type: String,
        required: false,
    },

    image: {
        type: String,
        required: false,
    },

    emoji: {
        type: String,
        required: false,
    },
    
});

export default mongoose.model("Badges", BadgesSchema);