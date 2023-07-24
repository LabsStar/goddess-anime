import { Schema } from "mongoose";
import mongoose from "mongoose";


const GuidesSchema = new Schema({
    slug: {
        type: String,
        required: true,
    },

    comments: {
        type: Array,
        required: true,
    },

    views: {
        type: Number,
        required: true,
    },



}, { timestamps: true });

export default mongoose.model("Guides", GuidesSchema);