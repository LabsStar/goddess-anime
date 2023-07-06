/**
 * @fileoverview This module contains the routes and handlers for the Goddess Anime Developer API.
 * @module devrouter
 * @requires express
 * @requires mongoose
 * @requires axios
 * @requires ../../config
 * @requires fs
 * @requires ../../models/developer_applications
 * @requires ../../utils/developerapps
 * @requires ../../models/user
 * @requires ../../models/badges
 */

import { Request, Response, Router } from 'express';
import { Document, DocumentDefinition } from 'mongoose';
import axios from 'axios';
import config from '../../config';
import fs from "fs";
import developer_applications from '../../models/developer_applications';
import { ApplicationStatus, Permissions } from "../../utils/developerapps";
import user from '../../models/user';
import badges from '../../models/badges';

const availableBanners = [".png", ".jpg", ".jpeg", ".gif"];

const { OPEN_FOR_DEVLOPERS } = config;


/**
 * Sends an error response to the client.
 * @param {Response} res - The response object.
 * @param {string} error - The error message.
 * @param {number} code - The HTTP status code.
 * @returns {object} - The error response.
 */
const sendError = (res: Response, error?: string, code?: number) => {
    if (!error) error = "An unknown error occurred.";
    if (!code) code = 500;

    return res.status(code).json({
        error: true,
        message: error
    });
};

/**
 * Checks if a user is authorized to access a specific application.
 * @param {string} user_id - The user's ID.
 * @param {string} application_id - The application's ID.
 * @returns {boolean} - Whether the user is authorized or not.
 * @throws {Error} - If no user or application ID is provided, or if the IDs are invalid.
 */
const checkIfAuthorized = async (user_id: string, application_id: string) => {
    if (!user_id) throw new Error("No user provided.");
    if (!application_id) throw new Error("No application id provided.");

    const application = await developer_applications.findOne({ client_secret: application_id });

    if (!application) throw new Error("Invalid application id provided.");

    const userDoc = await user.findOne({ token: user_id });

    if (!userDoc) throw new Error("Invalid user id provided.");

    const userApplication = userDoc.applications.find((app: any) => app.id === application_id);

    if (!userApplication) return false;

    return true;
};

const devrouter = Router();

devrouter.use((req: Request, res: Response, next: Function) => {
    res.setHeader("X-Powered-By", "Hyperstar");

    if (!OPEN_FOR_DEVLOPERS) return sendError(res, "The developer api is currently closed.", 401);

    next();
});

devrouter.use(async (req: Request, res: Response, next: Function) => {
    const client_secret = req.headers["authorization"]?.toString().replace("Bearer ", "");
    const UserAgent = req.headers["user-agent"];

    if (!client_secret) return sendError(res, "No client secret provided.", 401);

    const application = await developer_applications.findOne({ client_secret: client_secret });

    if (!application) return sendError(res, "Invalid client secret provided.", 401);

    if (UserAgent !== "GoddessAnime/DeveloperApi") return sendError(res, "Invalid user agent provided.", 401);

    if (application.status !== ApplicationStatus.ACCEPTED) return sendError(res, "Your application is not accepted yet. Please open a support ticket.", 401);

    next();
});

const remove = (userDoc: any, type: string[]) => {
    const userObj = userDoc.toObject();

    for (const thing in userObj) {
        if (type.includes(thing)) {
            delete userObj[thing];
        }
    }

    return userObj;
};

/**
 * Handles the root endpoint.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
devrouter.get('/', (req: Request, res: Response) => {
    res.json({
        error: false,
        message: "Welcome to the Goddess Anime Developer API!"
    });
});

/**
 * Handles the change-settings endpoint.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
devrouter.post('/change-settings', async (req: Request, res: Response) => {
    try {
        const { settings, user_request } = req.body;

        if (!user_request) return sendError(res, "No user provided.", 400);
        if (!settings) return sendError(res, "No settings provided.", 400);


        const userDoc = await user.findOne({ discordId: user_request }) as DocumentDefinition<any>;

        if (!userDoc) return sendError(res, "Invalid user provided.", 400);

        if (!checkIfAuthorized(userDoc.token as string, req.headers["client-secret"] as string)) return sendError(res, "You are not authorized to change this user's settings.", 401);

        const developerApplication = await developer_applications.findOne({ client_secret: req.headers["client-secret"] });

        if (!developerApplication) return sendError(res, "Invalid client secret provided.", 400);

        if (!developerApplication.permissions.includes(Permissions.UPDATE_SETTINGS)) return sendError(res, "You do not have permission to change settings.", 400);

        const thingsToChange: any = {};

        const thingsCanChange = ["banner", "about", "pronouns"];

        const checkBanner = (banner: string) => {


            const bannerEx = banner.toLowerCase();
            const isValidBanner = availableBanners.some(extension => bannerEx.endsWith(extension));

            return isValidBanner;
        };


        for (const thing in settings) {
            if (thingsCanChange.includes(thing)) {
                if (thing === "banner") {
                    if (!checkBanner(settings[thing])) return sendError(res, `Invalid banner provided: ${settings[thing]}.
                Valid banners are: ${availableBanners.join(", ")}`, 400);
                    else thingsToChange[thing] = settings[thing];
                }
                else {
                    thingsToChange[thing] = settings[thing];
                }
            }
            else {
                return sendError(res, `Invalid setting provided: ${thing}.
            Valid settings are: ${thingsCanChange.join(", ")}`, 400);
            }
        }

        const updatedUser = await user.findOneAndUpdate({ discordId: user_request }, thingsToChange, { new: true });

        if (!updatedUser) return sendError(res, `An error occurred while ${userDoc.username} tried to update their settings.`, 500);

        res.json({
            error: false,
            message: "Successfully updated user.",
            updated: thingsToChange,
            invalid: Object.keys(settings).filter((setting: string) => !thingsCanChange.includes(setting))
        });
    }
    catch (err) {
        console.error(err);
        return sendError(res, "An error occurred while updating the user's settings.", 500);
    }
});

/**
 * Handles the get-user endpoint.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
devrouter.get('/get-user', async (req: Request, res: Response) => {
    try {
        const { user_id } = req.query;

        if (!user_id) return sendError(res, "No user id provided.", 400);

        const userDoc = await user.findOne({ discordId: user_id }) as DocumentDefinition<any>;

        if (!userDoc) return sendError(res, "Invalid user id provided.", 400);

        if (!checkIfAuthorized(userDoc.token, req.headers["client-secret"] as string)) return sendError(res, "You are not authorized to get this user's information.", 401);

        const developerApplication = await developer_applications.findOne({ client_secret: req.headers["client-secret"] });

        if (!developerApplication) return sendError(res, "Invalid client secret provided.", 400);

        if (!developerApplication.permissions.includes(Permissions.VIEW_USERS)) return sendError(res, "You do not have permission to view users.", 400);


        res.json({
            error: false,
            message: "Successfully retrieved user.",
            user: remove(userDoc, ["token", "__v", "applications", "_id"])
        });
    }
    catch (err) {
        console.error(err);
        return sendError(res, "An error occurred while getting the user.", 500);
    }
});

/**
 * Handles the update-badges endpoint.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @todo Add support for removing badges.
*/

devrouter.put("/update-badges", async (req: Request, res: Response) => {
    try {
        const { user_id, badge_id } = req.body;

        if (!user_id) return sendError(res, "No user id provided.", 400);

        if (!badge_id) return sendError(res, "No badge id provided.", 400);

        const userDoc = await user.findOne({ discordId: user_id }) as DocumentDefinition<any>;

        if (!userDoc) return sendError(res, "Invalid user id provided.", 400);

        if (!checkIfAuthorized(userDoc.token, req.headers["client-secret"] as string)) return sendError(res, "You are not authorized to update this user's badges.", 401);

        const developerApplication = await developer_applications.findOne({ client_secret: req.headers["client-secret"] });

        if (!developerApplication) return sendError(res, "Invalid client secret provided.", 400);

        if (!developerApplication.permissions.includes(Permissions.UPDATE_BADGES)) return sendError(res, "You do not have permission to update badges.", 400);

        const badgeDoc = await badges.findOne({ id: badge_id });

        if (!badgeDoc) return sendError(res, "Invalid badge id provided.", 400);

        const userBadge = userDoc.badges.find((badge: any) => badge === badge_id);

        if (userBadge) return sendError(res, "User already has this badge.", 400);

        userDoc.badges.push(badge_id);

        userDoc.save();

        res.json({
            error: false,
            message: "Successfully updated user's badges.",
            user: remove(userDoc, ["token", "__v", "applications", "_id"]),
            badge: badgeDoc
        });
    }
    catch (err) {
        console.error(err);
        return sendError(res, "An error occurred while updating the user's badges.", 500);
    }
});

export default devrouter;