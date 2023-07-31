import { Schema } from "mongoose";
import mongoose from "mongoose";


const BetaFormSchema = new Schema({
    serverId: {
        type: String,
        required: true,
    },

    userId: {
        type: String,
        required: true,
    },

    reason: {
        type: String,
        required: true,
    },

}, { timestamps: true });

export default mongoose.model("BetaForm", BetaFormSchema);