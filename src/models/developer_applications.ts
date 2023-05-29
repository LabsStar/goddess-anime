import { Schema } from "mongoose";
import mongoose from "mongoose";

import { ApplicationStatus, Permissions } from "../utils/developerapps";

function createClientId () {
    const numbs = "0123456789";
    let id = "";

    for (let i = 0; i < 10; i++) {
        id += numbs[Math.floor(Math.random() * numbs.length)];
    }

    return id;
}

function createClientSecret () {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let secret = "";

    for (let i = 0; i < 20; i++) {
        secret += chars[Math.floor(Math.random() * chars.length)];
    }

    return secret;
}



const DeveloperApplicationsSchema = new Schema({
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

    status: {
        type: String,
        required: false,
        default: ApplicationStatus.PENDING,
    },

    permissions: {
        type: Array,
        required: false,
    },

    creator: {
        type: String,
        required: false,
    },

    authorized_users: {
        type: Array,
        required: false,
    },

    client_id: {
        type: String,
        required: false,
        default: createClientId(),
    },

    client_secret: {
        type: String,
        required: false,
        default: createClientSecret(),
    },

}, { timestamps: true });

export default mongoose.model("Developer Applications", DeveloperApplicationsSchema);