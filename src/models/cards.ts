import { Schema } from "mongoose";
import mongoose from "mongoose";


const CardsSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },

    tagLine: {
        type: String,
        required: true,
    },

    sets: {
        type: Array,
        required: true,
    },

    creator: {
        type: String,
        required: true,
    },

    rarity: {
        type: String,
        required: true,
    },

    origin: {
        type: String,
        required: true,
    },

    stats: {
        type: Object,
        required: true,

        health: {
            type: Number,
            required: true,
        },

        attack: {
            type: Number,
            required: true,
        },
        
        defense: {
            type: Number,
            required: true,
        },

        mana: {
            type: Number,
            required: true,
        },

        speed: {
            type: Number,
            required: true,
        },

        luck: {
            type: Number,
            required: true,
        },
    },
}, { timestamps: true });

export default mongoose.model("Cards", CardsSchema);