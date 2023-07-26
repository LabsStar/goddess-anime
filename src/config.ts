// Author Note: 0xhylia 2023-05-22
/**
 * This file is used to store things that are used in multiple files.
 * THIS FILE IS NOT FOR SENSETIVE INFORMATION!
 */

import { version } from "../package.json";
import IConfig from "./interfaces/Config";

const config: IConfig = {
    prefix: "/",
    link: {
        name: "link",
        id: process.env.LINK_ID || "1109876060524380260",
    },
    catch: {
        name: "catch",
        id:  process.env.CATCH_ID || "1109951147898318889",
    },
    help: {
        name: "help",
        id: process.env.HELP_ID || "1109866175413878876",
    },
    TIME_TO_DELETE: 60000,
    SHOP_EXPIRE_DAYS: 3,
    RATE_LIMIT_WINDOW: 60000,
    NO_RATE_LIMIT: ["hylia.dev", "hyperstar.cloud", "goddessanime.com", "localhost", "hyperstar.live"],
    VERSION: version,
    allow_developer_applications: true,
    DEVELOPER_PREFIX: "dev/",
    COMMUNITY_UPDATES_CHANNEL:  process.env.COMMUNITY_UPDATES_CHANNEL || "1110434165670821948",
    IS_IN_DEV_MODE: true,
    BOT_ID: process.env.BOT_ID as string,
    COINS: {
        unverified: 40,
        verified: 100,
    },
    OPEN_FOR_DEVLOPERS: false,
    AUTOMATED_USERS: ["547923574833545226"],
    openSourceDate: "2023-05-24",
};

export default config;