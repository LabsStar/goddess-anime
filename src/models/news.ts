import { Schema } from "mongoose";
import mongoose from "mongoose";


const NewsSchema = new Schema({
    title: {
        type: String,
        required: false,
        default: "",
    },

    text: {
        type: String,
        required: false,
        default: "",
    },

    buttons: {
        type: Array,
        required: false,
        default: [],

        label: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },

        isBlue: {
            type: Boolean,
            required: true,
            default: false,
        },
    },

    background: {
        type: String,
        required: true
    },
});

export default mongoose.model("News", NewsSchema);