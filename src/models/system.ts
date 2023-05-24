import { Schema } from "mongoose";
import mongoose from "mongoose";
import config from "../config";

const generateDowntime = () => {
    const date = new Date();

    if (config.IS_IN_DEV_MODE) {
        date.setMinutes(date.getMinutes() + 1);
    }
    else {
        date.setHours(date.getHours() + 1);
    }
    return date;
}


const SystemSchema = new Schema({

    isDown: {
        type: Boolean,
        required: false,
        default: false,
    },

    downtimeMessage: {
        type: String,
        required: false,
        default: "Currently undergoing maintenance. Please check back later.",
    },

    expectedDowntime: {
        type: Date,
        required: false,
        default: generateDowntime(),
    },

    downtimePusher: {
        type: String,
        required: false,
        default: "System",
    },

}, { timestamps: true });

export default mongoose.model("System", SystemSchema);