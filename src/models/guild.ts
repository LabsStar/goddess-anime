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

    isBeta: {
        type: Boolean,
        required: false,
        default: false,
    }, /* This will mainly be used to have custom beta commands in a server. (ROLLING RELEASES) */
    

}, { timestamps: true });

export default mongoose.model("Guilds", GuildsSchema);