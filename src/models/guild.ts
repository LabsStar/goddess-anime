import { Schema } from "mongoose";
import mongoose from "mongoose";


const GuildsSchema = new Schema({
    guildId: {
        type: String,
        required: true,
    },

    spawnChannel: {
        type: String,
        required: false,
    },

    currentCards: {
        type: Array,
        required: false,
        default: [],
    },

    updateChannel: {
        type: String,
        required: false,
    },
    

}, { timestamps: true });

export default mongoose.model("Guilds", GuildsSchema);