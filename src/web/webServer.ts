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
import router from './api/main';
import badges from '../models/badges';
import config from '../config';
import system from '../models/system';
import shop from '../models/shop';
import { Document } from 'mongoose';

const IS_IN_DEV_MODE = config.IS_IN_DEV_MODE;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/api", router);
app.set("trust proxy", 1);
app.use((req, res, next) => {
    res.setHeader("X-Powered-By", "Hyperstar");
    next();
});

app.use(async (req, res, next) => {
    const systemDoc = await system.findOne({});

    if (!systemDoc) return generateErrorMessage(req, res, "An error occurred");

    if (IS_IN_DEV_MODE) return next();
    if (systemDoc.isDown) {
        return res.render("down", {
            auth: await auth(req, res, null),
            message: systemDoc.downtimeMessage,
            time: systemDoc.expectedDowntime,
        });
    }
    else {
        next();
    }
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

function generateErrorMessage(req: any, res: any, error: string) {
    const encodedError = Buffer.from(error).toString('base64');
    return res.redirect(`/?error=${encodedError}`);
}




function webServer(client: Client) {

    app.get('/', async (req, res) => {

        const error = req.query.error;

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


        if (!staff) return generateErrorMessage(req, res, "An error occurred");


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

        console.log(await marketPromise);


        res.render("home", {
            discord: client,
            news: await news.find({}),
            auth: await auth(req, res, null),
            market: await marketPromise,
            error: error ? error : null,
            staff: slicedStaff,
        })
    });

    app.get("/login", (req, res) => {
        if (req.cookies.token) return generateErrorMessage(req, res, "You are already logged in.");
        res.redirect(`${process.env.redirectUri}`);
    });

    app.get("/oauth", async (req, res) => {
        let isNewUser = false;
        const data_1 = new URLSearchParams();
        data_1.append('client_id', client.user?.id.toString()!);
        data_1.append('client_secret', process.env.clientSecret!);
        data_1.append('grant_type', 'authorization_code');
        data_1.append('redirect_uri', `http://localhost/oauth`);
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
                .catch((err: any) => {
                    console.log(err);
                    generateErrorMessage(req, res, "An error occurred");
                });
        } catch (error) {
            console.log(error);
            generateErrorMessage(req, res, "An error occurred");
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

        if (!uId) return generateErrorMessage(req, res, "No user ID provided");

        try {
            await client.users.fetch(uId);
        }
        catch (err) {
            return generateErrorMessage(req, res, "Invalid user ID provided");
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

        if (!uId) return generateErrorMessage(req, res, "No user ID provided");

        try {
            await client.users.fetch(uId);
        }
        catch (err) {
            return generateErrorMessage(req, res, "Invalid user ID provided");
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

        if (!content) return generateErrorMessage(req, res, "No content provided");

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
                return generateErrorMessage(req, res, "Invalid content provided");
        }
    });


    app.get("/card/:id", async (req, res) => {
        const cId = req?.params?.id?.toString();

        if (!cId) return generateErrorMessage(req, res, "No card ID provided");

        if (cId.length !== 24) return generateErrorMessage(req, res, "Invalid card ID provided");

        if (checkIfBsonId(cId) === false) return generateErrorMessage(req, res, "Invalid card ID provided");

        const isInDb = await cards.findOne({ _id: cId });

        if (!isInDb) return generateErrorMessage(req, res, "Invalid card ID provided");

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

    app.get("/application/:id?", async (req, res) => {

        if (!config.allow_developer_applications) return generateErrorMessage(req, res, "Developer applications are currently closed");
        const aId = req?.params?.id?.toString();

        if (!aId) return generateErrorMessage(req, res, "No application ID provided");

        // if (aId.length !== 24) return generateErrorMessage(req, res, "Invalid application ID provided");

        // if (checkIfBsonId(aId) === false) return generateErrorMessage(req, res, "Invalid application ID provided");

        const app = {
            _id: aId,
            name: "Test Application",
            description: "This is a test application",
            icon: "https://cdn.discordapp.com/attachments/1093655688431013909/1110395230332649513/download.png",
            owner: await user.findOne({ discordId: "1102808167760531457" }).then((user) => { return user; }),
            permissions: ["APPLY_SETTINGS", "MANAGE_APPLICATIONS"],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        if (!app) return generateErrorMessage(req, res, "Invalid application ID provided");

        console.log(app);

        if (!await auth(req, res, app)) return generateErrorMessage(req, res, "You are not logged in");

        return res.render("application", {
            discord: client,
            auth: await auth(req, res, null),
            application: app,
        });



    });



    app.listen(process.env.PORT || 80, () => {
        logger.info(`Goddess Anime is listening at http://localhost:${process.env.PORT || 80}`);

    });
}

export default webServer;
