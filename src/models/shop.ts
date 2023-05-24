import { Schema } from "mongoose";
import mongoose from "mongoose";
import config from "../config";

const createExpires = () => {
    const expires = new Date();

    return expires.setDate(expires.getDate() + config.SHOP_EXPIRE_DAYS);
};

const ShopSchema = new Schema({
    card: {
        type: String,
        required: false,
    },

    price: {
        type: Number,
        required: false,
    },

    seller: {
        type: String,
        required: false,
    },

    personal_id: {
        type: String,
        required: false,
    },

    expires: {
        type: Date,
        required: false,
        default: createExpires(),
    },

}, { timestamps: true });

export default mongoose.model("Shop", ShopSchema);