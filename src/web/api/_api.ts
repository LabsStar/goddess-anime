import user from '../../models/user';
import cards from '../../models/cards';
import guild from '../../models/guild';
import news from '../../models/news';
import badges from '../../models/badges';
import { Request, Response, Router } from 'express';
import { Document, DocumentDefinition } from 'mongoose';
import axios from 'axios';
import config from '../../config';
import fs from "fs";
import developer_applications from '../../models/developer_applications';
import { ApplicationStatus, Permissions } from "../../utils/developerapps";
import path from "path";


const findTimeZone = async (ipAddress: string) => {
    const { data } = await axios.get(`http://ip-api.com/json/${ipAddress}`);
    return data.timezone;
};


const formatTime = (time: number, timeZone?: string) => {
    return Intl.DateTimeFormat('en-US', {
        timeZone: timeZone || 'America/New_York',
        minute: '2-digit',
        second: '2-digit'
    }).format(time);
};



const apirouter = Router();

apirouter.use((req: Request, res: Response, next: Function) => {
    res.setHeader("X-Powered-By", "Hyperstar");
    next();
});

const rateLimitMap = new Map<string, number>();

const rateLimiter = async (req: Request, res: Response, next: Function) => {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (rateLimitMap.has(ipAddress as string)) {
        const currentTime = Date.now();
        const lastRequestTime = rateLimitMap.get(ipAddress as string) as number || 0;
        const timeDifference = currentTime - lastRequestTime;

        // Set the rate limit window to 1 minute (60000 milliseconds)
        const rateLimitWindow = config.RATE_LIMIT_WINDOW;

        if (timeDifference < rateLimitWindow) {
            const timeRemaining = rateLimitWindow - timeDifference;
            const timeZone = await findTimeZone(ipAddress as string);

            if (timeZone) {
                const formattedTime = formatTime(timeRemaining, timeZone);
                return res.status(429).json({
                    error: true,
                    message: `Too many requests. Please try again in ${formattedTime}.`,
                });
            }
        }
    }

    // If the IP address is not in the rate limit map, add it to the map
    if (!config.NO_RATE_LIMIT.includes(req.headers["host"] as string)) rateLimitMap.set(ipAddress as string, Date.now());
    else rateLimitMap.set(ipAddress as string, 0);
    next();
};

apirouter.use(rateLimiter);

apirouter.get('/', (req: Request, res: Response) => {
    res.json({
        error: false,
        message: "Welcome to the API."
    });
});

apirouter.get('/users/:id/:field?', async (req: Request, res: Response) => {
    try {
        const { id, field } = req.params;

        if (!id) {
            return res.json({ error: true, message: "User ID not provided." });
        }

        const userDoc = await user.findOne({ discordId: id });

        if (!userDoc) {
            return res.json({ error: true, message: "User not found." });
        }

        const removeToken = (userDoc: any) => {
            const userObj = userDoc.toObject();
            delete userObj.token;
            return userObj;
        };

        if (!field) {
            return res.json({ error: false, message: removeToken(userDoc) });
        }

        const fieldValue = userDoc[field as keyof typeof userDoc];

        if (!fieldValue) {
            return res.json({ error: true, message: "Field not found." });
        }

        if (field === "token") {
            return res.json({ error: false, message: "Token found but not shown." });
        }

        if (req.query.raw === "true") {
            if (fieldValue.includes("http")) {
                res.redirect(fieldValue);
            }
            else {
                res.status(200).send(fieldValue);
            }
        }
        else {
            res.json({ error: false, message: fieldValue });
        }

    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ error: true, message: error });
    }
});


apirouter.get('/cards/:id?', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            const allCards = await cards.find({});
            res.json({ error: false, message: allCards });
        } else {
            const cardDoc = await cards.findOne({ _id: id });

            if (!cardDoc) {
                res.json({ error: true, message: "Card not found." });
            } else {
                res.json({ error: false, message: cardDoc });
            }
        }
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ error: true, message: error });
    }
});

apirouter.get('/guilds/:id?/:field?', async (req: Request, res: Response) => {

    let sensitiveFields = [] as string[];

    const removeSensitiveInfo = (guildDoc: any) => {
        const guildObj = guildDoc.toObject();
        sensitiveFields.forEach(field => delete guildObj[field]);

        return guildObj;
    };

    try {
        const { id, field } = req.params;

        if (!id) {
            const allGuilds = await guild.find({});
            res.json({ error: false, message: allGuilds.map(removeSensitiveInfo) });
        } else {
            const guildDoc = await guild.findOne({ guildId: id });

            if (!guildDoc) {
                res.json({ error: true, message: "Guild not found." });
            } else {
                if (!field) {
                    res.json({ error: false, message: removeSensitiveInfo(guildDoc) });
                } else {
                    const fieldValue = guildDoc[field as keyof typeof guildDoc];


                    if (!fieldValue) {
                        res.json({ error: true, message: "Field not found." });
                    } else {
                        // Check if the field is sensitive
                        if (sensitiveFields.includes(field)) {
                            res.json({ error: false, message: "Field found but not shown." });
                        } else {
                            res.json({ error: false, message: fieldValue });
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ error: true, message: error });
    }
});



apirouter.get('/news/:id?', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            const allNews = await news.find({});
            res.json({ error: false, message: allNews });
        } else {
            const newsDoc = await news.findOne({ _id: id });

            if (!newsDoc) {
                res.json({ error: true, message: "News not found." });
            } else {
                res.json({ error: false, message: newsDoc });
            }
        }
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ error: true, message: error });
    }
});


apirouter.get('/badges/:id?', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            const allBadges = await badges.find({});
            res.json({ error: false, message: allBadges });
        } else {
            const badgeDoc = await badges.findOne({ _id: id });

            if (!badgeDoc) {
                res.json({ error: true, message: "Badge not found." });
            } else {
                res.json({ error: false, message: badgeDoc });
            }
        }
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ error: true, message: error });
    }
});


apirouter.post("/settings", async (req: Request, res: Response) => {
    try {
        if (!req.headers["authorization"]) return res.status(401).json({ error: "You are not authorized to access this endpoint." });



        const userDoc = await user.findOne({ token: req.headers["authorization"] as string });

        if (!userDoc) return res.status(404).json({ error: "This user does not exist." });

        const updates: DocumentDefinition<Document<typeof user>> = {};

        const forbiddenUpdates = ["discordId", "token", "username", "discriminator", "avatar", "verified", "createdAt", "updatedAt", "__v", "cards", "badges", "inventory", "bank", "wallet", "activity"];

        for (const key in req.body) {

            if (forbiddenUpdates.includes(key)) return res.status(400).json({ error: `You cannot update '${key}'.` });

            if (req.body[key] !== '') {
                updates[key as keyof DocumentDefinition<Document<typeof user>>] = req.body[key];
            }
        }




        Object.assign(userDoc, updates);

        await userDoc.save();

        res.status(200).json({ message: "Successfully updated your profile.", updated: updates });
    } catch (err) {
        res.json({ error: true, message: err });
    }
});

apirouter.get("/open-source", async (req: Request, res: Response) => {
    try {
        const github_repo = "https://api.github.com/repos/LabsStar/goddess-anime";

        const [github_repo_data, commits, issues, github_repo_contributors] = await Promise.all([
            axios.get(github_repo).then(res => res.data),
            axios.get(`${github_repo}/commits`).then(res => res.data),
            axios.get(`${github_repo}/issues`).then(res => res.data),
            axios.get(`${github_repo}/contributors`).then(res => res.data)
        ]);

        const github_repo_contributors_data = github_repo_contributors.map((contributor: { login: string, avatar_url: string, html_url: string }) => ({
            name: contributor.login,
            avatar: contributor.avatar_url,
            url: contributor.html_url
        }));

        const commits_data = commits.map((commit: { commit: { message: string }, html_url: string, author: { login: string, avatar_url: string } }) => ({
            message: commit.commit.message,
            url: commit.html_url,
            author: commit.author.login,
            avatar: commit.author.avatar_url
        }));

        const issues_data = issues.map((issue: { title: string, body: string, html_url: string, user: { login: string, avatar_url: string } }) => ({
            title: issue.title,
            description: issue.body,
            url: issue.html_url,
            author: issue.user.login,
            avatar: issue.user.avatar_url
        }));

        const repo = {
            name: github_repo_data.name,
            description: github_repo_data.description,
            stars: github_repo_data.stargazers_count,
            forks: github_repo_data.forks_count,
            issues: github_repo_data.open_issues_count,
            contributors: github_repo_contributors.length,
            url: github_repo_data.html_url,
            contributors_data: github_repo_contributors_data,
            issues_data,
            commits: commits_data,
            image: `https://contrib.rocks/image?repo=${github_repo.replace("https://api.github.com/repos/", "")}`
        };

        res.json({ error: false, message: repo });
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ error: true, message: error });
    }
});

apirouter.get("/ping", async (req: Request, res: Response) => {
    try {
        res.json({ error: false, message: "Pong!" });
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ error: true, message: error });
    }
});

apirouter.get("/process/:type?/:subType?", async (req: Request, res: Response) => {

    const processInfo = {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        cpuUsage: process.cpuUsage(),
        platform: process.platform,
        pid: process.pid,
        version: process.version,
        versions: process.versions,
        arch: process.arch,
        argv: process.argv,
        execArgv: process.execArgv,
        execPath: process.execPath,
        title: process.title,
        cwd: process.cwd(),
        config: config,
    };

    

    if (!req.params.type) return res.json({ error: false, message: processInfo });


    if (!req.params.subType) return res.json({ error: false, message: processInfo[req.params.type as keyof typeof processInfo] });

    //@ts-ignore
    res.json({ error: false, message: processInfo[req.params.type as keyof typeof processInfo][req.params.subType as keyof typeof processInfo] });
});


apirouter.post("/applicaton-auth", async (req: Request, res: Response) => {
    try {
      const { client_id, client_secret, auth_token } = req.body;
  
      if (!client_id || !client_secret || !auth_token) return res.status(400).json({ error: true, message: "Missing required fields." });
      
  
      const userDoc = await user.findOne({ token: auth_token });
      if (!userDoc) return res.status(404).json({ error: true, message: "Not authorized." });
      
  
      const application = await developer_applications.findOne({ client_secret: client_secret });
      if (!application) return res.status(404).json({ error: true, message: "Application not found." });
      
  
      if (application.client_id !== client_id) return res.status(401).json({ error: true, message: "Invalid client ID." });
  
      if (application.client_secret !== client_secret) return res.status(401).json({ error: true, message: "Invalid client secret." });
  
      if (application.status !== ApplicationStatus.ACCEPTED) return res.status(401).json({ error: true, message: "Application not accepted." });
      
  
      if (application.authorized_users.includes(userDoc.discordId)) return res.status(401).json({ error: true, message: "You are already authorized." });
      
  
      application.authorized_users.push(userDoc.discordId);
      await application.save();
  
      userDoc.applications.push(application.client_id);
      await userDoc.save();
  
      res.json({ error: false, message: "Successfully authorized." });
    } catch (error) {
      console.error("Error in application authorization:", error);
      res.status(500).json({ error: true, message: "Internal server error." });
    }
  });


  apirouter.get("/logs", async (req: Request, res: Response) => {
    const logFilePath = path.resolve(__dirname, "../../../log");

    try {
        const file = fs.readFileSync(logFilePath, 'utf-8');
        return res.send(`<pre>${file}</pre>`)
    } catch (error) {
        console.error(error)
        return res.status(404).json({ error: true, message: "./log is not found. Please Contact the developers." });
    }

  });
  




export default apirouter;
