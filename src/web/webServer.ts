import express from 'express';
const app = express();
import { Client } from "discord.js";
import logger from '../utils/logger';
import cron from "node-cron";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import { URLSearchParams } from 'url';
import cookieParser from "cookie-parser";
import path from "path";
import ejs, { render } from "ejs";
import fs from "fs";
import news from '../models/news';
import user from '../models/user';
import axios from 'axios';
import cards from '../models/cards';
import apirouter from './api/_api';
import badges from '../models/badges';
import config from '../config';
import system from '../models/system';
import shop from '../models/shop';
import { Document } from 'mongoose';
import ErrorCodes from '../utils/errorcodes';
import developer_applications from '../models/developer_applications';
import devrouter from './developer/_api';
import { ApplicationStatus, Permissions } from "../utils/developerapps";

const IS_IN_DEV_MODE = config.IS_IN_DEV_MODE;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/api", apirouter);
app.use("/dev", devrouter);
app.set("trust proxy", 1);
app.use((req, res, next) => {
    res.setHeader("X-Powered-By", "Hyperstar");
    next();
});

function checkIfBsonId(id: string) {

    const bjsonRegex = /^[0-9a-fA-F]{24}$/;

    if (bjsonRegex.test(id)) return true;
    else return false;
}

async function auth(req: any, res: any, next: any) {
    if (req.cookies.token) {
        const userDoc = await user.findOne({ token: req.cookies.token });

        if (userDoc) return userDoc;
        else return null;
    } else {
        return null;
    }
}

async function getUserCards(id: string, split: boolean) {
    const userDoc = await user.findOne({ discordId: id });

    if (!userDoc) {
        return null;
    }

    const cardIds = userDoc.cards.map((card) => String(card.id)); // Extract id value from card object
    const userCards = await cards.find({ _id: { $in: cardIds } });

    if (!split) {
        return userCards;
    } else {
        return userCards.slice(0, 9);
    }
}




function webServer(client: Client) {

    async function generateErrorMessage(req: any, res: any, error: string, code?: ErrorCodes) {
        return res.render("error", {
            discord: client,
            auth: await auth(req, res, null),
            error: error,
            code: code || ErrorCodes.DEFAULT_ERROR,
        });
    
    }

    app.get('/', async (req, res) => {

        const error = req.query.error;
        const code = req.query.code;

        const staffRole = await client.guilds.cache.get(process.env.SUPPORT_SERVER as string)?.roles.cache.get(process.env.STAFF_ROLE as string);

        const staff = staffRole?.members.map(async (member) => {
            const userRecord = await user.findOne({ discordId: member.user.id });
            const pronouns = userRecord?.pronouns || "They/Them"; // Set default value if pronouns are not found
            const verified = userRecord?.verified || false; // Set default value if verified is not found

            const staffMember = {
                name: member.user.username,
                avatar: member.user.displayAvatarURL({ dynamic: true }),
                id: member.user.id,
                pronouns: pronouns,
                verified: verified,
            };

            return staffMember;
        });


        if (!staff) return await generateErrorMessage(req, res, "An error occurred", ErrorCodes.UNKOWN_ERROR);


        const staffPromise = Promise.all(staff);
        const staffArray = await staffPromise;
        const slicedStaff = staffArray.splice(0, 9);

        const market = await shop.find({}).sort({ price: -1 }).limit(9);

        const marketMap = market.map(async (item) => {
            const card = await cards.findOne({ _id: item.card });
            const userDoc = await user.findOne({ discordId: item.seller });

            const marketItem = {
                id: item._id,
                price: item.price,
                card: card,
                seller: userDoc,
            };

            return marketItem;
        });

        const marketPromise = Promise.all(marketMap);

        res.render("home", {
            discord: client,
            news: await news.find({}),
            auth: await auth(req, res, null),
            market: await marketPromise,
            error: error ? error : null,
            code: code ? code : null,
            staff: slicedStaff,
        })
    });

    app.get("/login", async (req, res) => {
        if (req.cookies.token) return await generateErrorMessage(req, res, "You are already logged in.", ErrorCodes.LOGGED_IN);
        res.redirect(`${process.env.redirectUri}`);
    });

    app.get("/oauth", async (req, res) => {
        let isNewUser = false;
        const data_1 = new URLSearchParams();
        data_1.append('client_id', client.user?.id.toString()!);
        data_1.append('client_secret', process.env.clientSecret!);
        data_1.append('grant_type', 'authorization_code');
        data_1.append('redirect_uri', `${process.env.oauthRedirectUri}`);
        data_1.append('scope', 'identify, email, connections');
        data_1.append('code', req?.query?.code?.toString()!);

        try {
            const tokenResponse = await fetch('https://discord.com/api/oauth2/token', { method: 'POST', body: data_1 });
            const tokenData = await tokenResponse.json() as { access_token: string };

            const options = {
                method: 'GET',
                url: 'https://discord.com/api/users/@me',
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`
                }
            };

            const connection_options = {
                method: 'GET',
                url: 'https://discord.com/api/users/@me/connections',
                headers: {
                    "Authorization": `Bearer ${tokenData.access_token}`
                }
            };

            axios.get(options.url, { headers: options.headers })
                .then(async (response: any) => {
                    const userData = response.data;

                    const connections = await axios.get(connection_options.url, { headers: connection_options.headers });

                    console.log(connections.data);

                    user.findOne({ discordId: userData.id }).then(async (userDoc: any) => {
                        if (!userDoc) {
                            isNewUser = true;
                            userDoc = new user({
                                discordId: userData.id,
                                username: userData.username,
                                discriminator: userData.discriminator,
                                avatar: `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.${userData.avatar?.startsWith('a_') ? 'gif' : 'png'}?size=1024`,
                                balance: 0,
                                bank: 0,
                                verified: false,
                                cards: [],
                                inventory: [],
                                badges: [],
                                socials: connections.data.map((connection: any) => {
                                    return {
                                        name: connection.type,
                                        url: connection.url
                                    }
                                }),
                            });
                            await userDoc.save();
                        } else {
                            userDoc.username = userData.username;
                            userDoc.discriminator = userData.discriminator;
                            userDoc.avatar = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.${userData.avatar?.startsWith('a_') ? 'gif' : 'png'}?size=1024`;
                            userDoc.socials = connections.data.map((connection: any) => {
                                return {
                                    name: connection.type,
                                    username: connection.name,
                                }
                            });
                            await userDoc.save();
                        }

                        const token = userDoc.token;


                        res.cookie('token', token, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });

                        if (isNewUser) {
                            res.redirect('/profile?new=true');
                        }
                        else {
                            res.redirect('/profile');
                        }

                    });
                })
                .catch(async (err: any) => {
                    console.log(err);
                    await generateErrorMessage(req, res, "An error occurred", ErrorCodes.UNKOWN_ERROR); // If only there was a simple way... But I am stupid so we use a function to call the error messages.
                });
        } catch (error) {
            console.log(error);
            await generateErrorMessage(req, res, "An error occurred", ErrorCodes.UNKOWN_ERROR);
        }
    });

    app.get("/profile", async (req, res) => {
        const userDoc = await auth(req, res, null);

        if (!userDoc) return res.redirect("/login");

        const isNewUser = req?.query?.new?.toString() === 'true';

        res.redirect(`/user/${userDoc.discordId}${isNewUser ? '?new=true' : ''}`);
    });

    app.get("/user/:id", async (req, res) => {
        const uId = req?.params?.id?.toString();
        const newUser = req?.query?.new?.toString() || false;

        if (!uId) return await generateErrorMessage(req, res, "No user ID provided", ErrorCodes.INVALID_USER_ID);

        try {
            await client.users.fetch(uId);
        }
        catch (err) {
            return await generateErrorMessage(req, res, "Invalid user ID provided", ErrorCodes.INVALID_USER_ID);
        }

        const isInDb = await user.findOne({ discordId: uId });

        if (!isInDb) return res.render("default/user", {
            discord: client,
            auth: await auth(req, res, null),
            user: client.users.cache.get(uId),
        });

        return res.render("user", {
            discord: client,
            auth: await auth(req, res, null),
            user: isInDb,
            new: newUser,
            cards: await getUserCards(uId, true), // We only want to show 9 cards on the user page for performance reasons
            fullCards: await getUserCards(uId, false),
            badges: await badges.find({ _id: { $in: isInDb.badges } }),
        });

    });

    app.get("/user/:id/cards", async (req, res) => {
        const uId = req?.params?.id?.toString();

        if (!uId) return await generateErrorMessage(req, res, "No user ID provided", ErrorCodes.INVALID_USER_ID);

        try {
            await client.users.fetch(uId);
        }
        catch (err) {
            return await generateErrorMessage(req, res, "Invalid user ID provided", ErrorCodes.INVALID_USER_ID);
        }

        const isInDb = await user.findOne({ discordId: uId });

        if (!isInDb) return res.render("default/user", {
            discord: client,
            auth: await auth(req, res, null),
            user: client.users.cache.get(uId),
        });

        return res.render("user/cards", {
            discord: client,
            auth: await auth(req, res, null),
            user: isInDb,
            cards: await getUserCards(uId, false),
        });
    });


    app.get("/activity", async (req, res) => {
        if (!req.cookies.token) return res.redirect("/login");

        const userDoc = await user.findOne({ userId: req.cookies.token });

        if (!userDoc) return res.redirect("/login");

        let activity = userDoc.activity;



        activity.forEach((activity) => {
            activity.timestamp = new Date(activity.timestamp).getTime();
        });
        activity.sort((a, b) => b.timestamp - a.timestamp);

        res.render("user/activity", {
            discord: client,
            auth: await auth(req, res, null),
            userData: {
                activity: activity || [],
            }
        });


    });

    app.get("/settings", async (req, res) => {
        if (!req.cookies.token) return res.redirect("/login");

        const userDoc = await user.findOne({ userId: req.cookies.token });

        if (!userDoc) return res.redirect("/login");

        res.render("user/settings", {
            discord: client,
            auth: await auth(req, res, null),
            token: req.cookies.token,
        });
    });

    app.get("/logout", async (req, res) => {
        if (!req.cookies.token) return res.redirect("/login");

        res.clearCookie("token");

        res.redirect(req.headers.referer || "/");
    });

    app.get("/explore/:content", async (req, res) => {
        const content = req?.params?.content?.toString();

        if (!content) return await generateErrorMessage(req, res, "No content provided", ErrorCodes.NO_CONTENT);

        switch (content) {
            case "cards":
                return res.render("explore/cards", {
                    discord: client,
                    auth: await auth(req, res, null),
                    cards: await cards.find({}),
                });
            case "badges":
                return res.render("explore/badges", {
                    discord: client,
                    auth: await auth(req, res, null),
                    badges: await badges.find({}),
                });
            default:
                return await generateErrorMessage(req, res, "Invalid content provided", ErrorCodes.INVALID_CONTENT);
        }
    });


    app.get("/card/:id", async (req, res) => {
        const cId = req?.params?.id?.toString();

        if (!cId) return await generateErrorMessage(req, res, "No card ID provided", ErrorCodes.INVALID_CARD_ID);

        if (cId.length !== 24) return await generateErrorMessage(req, res, "Invalid card ID provided", ErrorCodes.INVALID_CARD_ID);

        if (checkIfBsonId(cId) === false) return await generateErrorMessage(req, res, "Invalid card ID provided", ErrorCodes.INVALID_CARD_ID);

        const isInDb = await cards.findOne({ _id: cId });

        if (!isInDb) return await generateErrorMessage(req, res, "Card not found", ErrorCodes.CARD_NOT_FOUND);

        return res.render("market/card", {
            discord: client,
            auth: await auth(req, res, null),
            card: isInDb,
        });
    });

    app.get("/faq", async (req, res) => {
        res.render("faq", {
            discord: client,
            auth: await auth(req, res, null),
        });
    });


    app.get("/shop/:id?", async (req, res) => {
        const { id } = req?.params;

        const shopItems = await shop.find({}).sort({ price: -1 });

        const getShopData = async (id: string) => {
            // Only show the item in shopItems that matches the id provided
            const shopItem = shopItems.filter((item) => item._id.toString() === id);

            if (shopItem.length === 0) return null;

            const card = await cards.findOne({ _id: shopItem[0].card });

            const userDoc = await user.findOne({ discordId: shopItem[0].seller });

            const mappedShopItem = {
                id: shopItem[0]._id,
                price: shopItem[0].price,
                card: card,
                seller: userDoc,
            };

            return mappedShopItem;
        };

        const shopMap = shopItems.map(async (item) => {
            const card = await cards.findOne({ _id: item.card });
            const userDoc = await user.findOne({ discordId: item.seller });

            const marketItem = {
                id: item._id,
                price: item.price,
                card: card,
                seller: userDoc,
            };

            return marketItem;
        });

        const shopPromise = Promise.all(shopMap);



        if (!id) return res.render("shop", {
            discord: client,
            auth: await auth(req, res, null),
            shop: await shopPromise,
        });

        if (checkIfBsonId(id) === false) return await generateErrorMessage(req, res, "Invalid shop ID provided", ErrorCodes.INVALID_SHOP_ID);

        const isInDb = await shop.findOne({ _id: id });

        if (!isInDb) return await generateErrorMessage(req, res, "Sorry, that item does not exist", ErrorCodes.SHOP_NOT_FOUND);

        return res.render("shop/card", {
            discord: client,
            auth: await auth(req, res, null),
            shop: await getShopData(id),
        });

    });

    app.get("/discord", async (req, res) => {
        res.redirect("https://discord.gg/u9cudxBVTG");
    });

    app.get("/invite", async (req, res) => {
        res.redirect(`https://discord.com/oauth2/authorize?client_id=${client.user?.id}&scope=bot&permissions=8%20applications.commands`);
    });

    app.get("/application/:id?", async (req, res) => {
        const aId = req?.params?.id?.toString();

        if (!req.cookies.token) return res.redirect("/login");

        if (config.allow_developer_applications === false) return res.redirect(req.headers.referer || "/");

        if (!aId) return await generateErrorMessage(req, res, "No application ID provided", ErrorCodes.INVALID_APPLICATION_ID);

        if (aId.length !== 10) return await generateErrorMessage(req, res, "Invalid application ID provided", ErrorCodes.INVALID_APPLICATION_ID);

        const app = await developer_applications.findOne({ client_id: aId });

        console.log(app);

        if (!app) return await generateErrorMessage(req, res, "Invalid application ID provided", ErrorCodes.INVALID_APPLICATION_ID);

        if (!await auth(req, res, app)) return await generateErrorMessage(req, res, "You are not logged in", ErrorCodes.NOT_LOGGED_IN);

        return res.render("applications/authorize", {
            discord: client,
            auth: await auth(req, res, null),
            application: app,
        });

    });


    app.get("/developers/applications/:id?", async (req, res) => {
        if (!req.cookies.token) return res.redirect("/login");

        const aId = req?.params?.id?.toString();

        if (config.allow_developer_applications === false) return res.redirect(req.headers.referer || "/");

        const authUser = await auth(req, res, null);

        if (!aId) {
            const applications = await developer_applications.find({ creator: authUser?.discordId });

            const mappedApplications = applications.map(async (application) => {
                const userDoc = await user.findOne({ discordId: application.creator });

                const mappedApplication = {
                    client_id: application.client_id,
                    image: application.image,
                    name: application.name,
                    createdAt: application.createdAt || new Date(),
                    creator: userDoc,
                };

                return mappedApplication;
            });

            const applicationsPromise = Promise.all(mappedApplications);


            return res.render("developers/index", {
                discord: client,
                auth: await auth(req, res, null),
                applications: await applicationsPromise,
            });
        }

        if (aId.length !== 10) return await generateErrorMessage(req, res, "Invalid application ID provided", ErrorCodes.INVALID_APPLICATION_ID);

        const app = await developer_applications.findOne({ client_id: aId });

        if (!app) return await generateErrorMessage(req, res, "Invalid application ID provided", ErrorCodes.INVALID_APPLICATION_ID);

        if (!await auth(req, res, app)) return await generateErrorMessage(req, res, "You are not logged in", ErrorCodes.NOT_LOGGED_IN);

        if (app.creator !== authUser?.discordId) return await generateErrorMessage(req, res, "You are not the creator of this application", ErrorCodes.UNKOWN_ERROR);

        return res.render("developers/view", {
            discord: client,
            auth: await auth(req, res, null),
            application: app,
        });

    });


    app.get("*", async (req, res) => {
        return await generateErrorMessage(req, res, `Page not found`, ErrorCodes.NO_PAGE);
    });


    app.listen(process.env.PORT || 80, () => {
        logger.info(`Goddess Anime is listening at http://localhost:${process.env.PORT || 80}`);
    });
}

export default webServer;
