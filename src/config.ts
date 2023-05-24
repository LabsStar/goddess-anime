// Author Note: 0xhylia 2023-05-22
/**
 * This file is used to store things that are used in multiple files.
 * THIS FILE IS NOT FOR SENSETIVE INFORMATION!
 */

import { version } from "../package.json";

const config = {
    prefix: "/",
    link: {
        name: "link",
        id: "1109876060524380260",
    },
    catch: {
        name: "catch",
        id: "1109951147898318889",
    },
    TIME_TO_DELETE: 60000,
    SHOP_EXPIRE_DAYS: 3,
    RATE_LIMIT_WINDOW: 60000,
    NO_RATE_LIMIT: ["hylia.dev", "hyperstar.cloud", "nanoha.live"],
    VERSION: version,
    allow_developer_applications: true,
    DEVELOPER_PREFIX: "dev/",
    COMMUNITY_UPDATES_CHANNEL: "1110434165670821948",
    IS_IN_DEV_MODE: true,
    BOT_ID: "1108925960952217610",
    COINS: {
        unverified: 40,
        verified: 100,
    },
};

export default config;