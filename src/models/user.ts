import { Schema } from "mongoose";
import mongoose from "mongoose";
import crypto from "crypto";
function createUserToken() {
    const userToken = crypto.randomBytes(32).toString("hex");
    return userToken;
}

const getRandomBanner = () => {
    const banners = [
        "https://i.pinimg.com/originals/7b/e1/23/7be1232b786e13dadc29bc52abdc38ce.jpg",
        "https://e0.pxfuel.com/wallpapers/1022/228/desktop-wallpaper-ps4-banners-anime-girl.jpg",
        "https://wallpapercave.com/wp/wp8880045.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTIfhKQvHWzH3m0sDDuM11WkQ3sEikETVk0f7P8mh0J1RitPq11TbZWduWn-vhIGB3cQ&usqp=CAU",
        "https://mmos.com/wp-content/uploads/2020/02/blue-protcol-boss-anime-art-banner.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9wW3-Xp7vazx4FoOuik1F8sV0t9ZB9HkTTQ&usqp=CAU",
        "https://wallpapercave.com/wp/wp5567636.jpg",
        "https://cdn.discordapp.com/attachments/1020761875979452458/1094213351741063188/wp5812534.jpg",
        "https://cdn.discordapp.com/attachments/1011313563991810188/1099007528278433852/konosuba-god-s-blessing-on-this-wonderful-world-aqua-1268708.webp",
        "https://cdn.discordapp.com/attachments/1011313563991810188/1099007528676888627/600x200.jpg",
        "https://cdn.discordapp.com/attachments/1011313563991810188/1099007528949530714/0403-the-rising-of-the-shield-hero-01.png",
        "https://cdn.discordapp.com/attachments/1011313563991810188/1099007529389920377/xue_hu_sang_indie_virtual_youtuber_drawn_by_somna__sample-0cb3a56bcd08fb8554c0a5c11e185d65.jpg",
        "https://cdn.discordapp.com/attachments/1011313563991810188/1099007529784189038/tumblr_85bcb796d5b8455b67cf9c6965a734ff_4f885443_1280.png",
        "https://cdn.discordapp.com/attachments/1011313563991810188/1099007530090369044/miko-hanazawa-waifugami-banner-5.jpg",
        "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/6d54da2c-4108-4e69-859f-590673c4aa25/d4pioou-cb084b99-db5b-44bf-b3ad-2327838e661a.png/v1/fit/w_500,h_200,q_70,strp/anime_girl_banner_by_kaitokins_d4pioou-375w-2x.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MjAwIiwicGF0aCI6IlwvZlwvNmQ1NGRhMmMtNDEwOC00ZTY5LTg1OWYtNTkwNjczYzRhYTI1XC9kNHBpb291LWNiMDg0Yjk5LWRiNWItNDRiZi1iM2FkLTIzMjc4MzhlNjYxYS5wbmciLCJ3aWR0aCI6Ijw9NTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.rsEmiW7xHTBQnFEJ6j1pGPXW1RpzafEVeKgQunICJgY",
        "https://wallpapercave.com/wp/wp5195565.jpg",
        "https://wallpapercave.com/wp/wp5484593.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2ce7o7G63MKB-fEYQg7zLJDomBDQA4G5Q0Q&usqp=CAU",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9wW3-Xp7vazx4FoOuik1F8sV0t9ZB9HkTTQ&usqp=CAU",
        "https://gifdb.com/images/high/anime-banner-gif-file-1880kb-anpk2r6p128lqcbk.gif",
        "https://media.tenor.com/wRMTDtqfwPsAAAAC/anime-girl-stare.gif",
        "https://pfps.gg/assets/banners/4173-girl-with-a-sword-banner.gif",
        "https://pfps.gg/assets/banners/1617-shirakami-fubuki-banner.gif",
        "https://pfps.gg/assets/banners/4990-blood-river.gif",
        "https://pfps.gg/assets/banners/7307-blood-borne-banner.gif"
    ];

    return banners[Math.floor(Math.random() * banners.length)];

};

const UserSchema = new Schema({
    discordId: {
        type: String,
        required: true,
    },

    username: {
        type: String,
        required: false,
    },

    customUsername: {
        type: String,
        required: false,
    },

    discriminator: {
        type: String,
        required: false,
    },

    avatar: {
        type: String,
        required: false,
    },

    verified: {
        type: Boolean,
        required: false,
        default: false,
    },

    cards: {
        type: Array,
        required: false,
        default: [],
    },

    banner: {
        type: String,
        required: false,
        default: getRandomBanner(),
    },

    wallet: {
        type: Number,
        required: false,
        default: 0,
    },

    bank: {
        type: Number,
        required: false,
        default: 0,
    },

    badges: {
        type: Array,
        required: false,
        default: [],
    },

    inventory: {
        type: Array,
        required: false,
    },

    token: {
        type: String,
        required: false,
        default: createUserToken()
    },

    pronouns: {
        type: String,
        required: false,
        default: "They/Them"
    },

    about: {
        type: String,
        required: false,
        default: "This user has not set an about me yet.",
    },

    socials: {
        type: Array,
        required: false,
        default: [],
    },

    activity: {
        type: Array,
        required: false,
        default: [],

        id: {
            type: String,
            required: true,
        },


        title: {
            type: String,
            required: true,
        },

        image: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            required: true,
            default: Date.now(),
        },
        url: {
            type: String,
            required: false,
            default: "https://goddessanime.com",
        },
        buttons: {
            type: Array,
            required: false,
            default: [],
            button: {
                type: String,
                required: true,
                label: {
                    type: String,
                    required: true,
                    default: "",
                },
                cb: {
                    type: String,
                    required: true,
                    default: "",
                },
            },
        },
    },

    applications: {
        type: Array,
        required: false,
        default: [],
    },

    premium: {
        type: Boolean,
        required: false,
        default: false,
    },

    stripe_customer_id: {
        type: String,
        required: false,
    },

    premium_type: {
        type: String,
        required: false,
        default: "None",
    },

    premium_end: {
        type: Date,
        required: false,
        default: Date.now(),
    },

    domain: {
        type: String,
        required: false,
        default: "goddessanime.com",
    },

    main_card: {
        type: String,
        required: false,
    },

    dailyRewards: {
        type: Object,
        required: false,
    },

    lastVoted: {
        type: Number,
        required: false,
    },

    displayName: {
        type: String,
        required: false,
    }

}, { timestamps: true });

export default mongoose.model("User", UserSchema);