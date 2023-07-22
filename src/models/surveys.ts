import { Schema } from "mongoose";
import mongoose from "mongoose";

enum RewardType {
    BADGE = "badge",
    COINS = "coins",
    CARD = "card",
    DEFAULT = "none"
}


const SurveySchema = new Schema({
    name: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    emoji: {
        type: String,
        required: true,
        default: "📝"
    },

    questions: {
        type: Array,
        required: true,
        default: ["No questions found"]
    },

    addedBy: {
        type: String,
        required: true,
        default: "1045919089048178828" // The Discord Bot's ID
    },

    reward: {
        type: String,
        required: true,
        default: RewardType.DEFAULT
    },

    submissions: {
        type: Array,
        required: false,
    },
});

export default mongoose.model("Survey", SurveySchema);