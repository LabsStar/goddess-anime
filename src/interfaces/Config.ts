interface IConfig {
    prefix: string;
    link: {
        name: string;
        id: string;
    };
    catch: {
        name: string;
        id: string;
    };
    help: {
        name: string;
        id: string;
    };
    TIME_TO_DELETE: number;
    SHOP_EXPIRE_DAYS: number;
    RATE_LIMIT_WINDOW: number;
    NO_RATE_LIMIT: string[];
    VERSION: string;
    allow_developer_applications: boolean;
    DEVELOPER_PREFIX: string;
    COMMUNITY_UPDATES_CHANNEL: string;
    IS_IN_DEV_MODE: boolean;
    BOT_ID: string;
    COINS: {
        unverified: number;
        verified: number;
    };
    OPEN_FOR_DEVLOPERS: boolean;
    AUTOMATED_USERS: string[];
    openSourceDate: string;
}

export default IConfig;