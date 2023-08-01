import { Request, Response, Router } from 'express';
import { Document, DocumentDefinition } from 'mongoose';
import axios from 'axios';
import config from '../../config';
import user from '../../models/user';
import CommunityForums from '../../models/CommunityForums';


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



const communityforumsrouter = Router();

communityforumsrouter.use((req: Request, res: Response, next: Function) => {
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

communityforumsrouter.use(rateLimiter);

communityforumsrouter.get('/', (req: Request, res: Response) => {
    res.json({
        error: false,
        message: "Welcome to the API."
    });
});

communityforumsrouter.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                error: true,
                message: "Missing required fields."
            });
        }

        const communityforums = await CommunityForums.findById(id);

        res.json({
            error: false,
            message: "CommunityForums found.",
            data: communityforums
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({
            error: true,
            message: "CommunityForums not found."
        });
    }
});

communityforumsrouter.post('/create', async (req: Request, res: Response) => {
    try {
        const { postTitle, postContent } = req.body;

        const title = postTitle as string;
        const description = postContent as string;

        const creator = req.cookies.token;

        const makeNormalText = (text: string) => {
            // Remove anything that was encoded in the URL (e.g. %20 for spaces)
            text = decodeURIComponent(text);

            // Remove any HTML tags
            text = text.replace(/<[^>]*>?/gm, '');
            
            // if anything is a newline character, make it a <p> tag followed ny the text inside and a closing </p> tag
            const lines = text.split('\n');
            text = '';
            for (const line of lines) {
                if (line.length > 0) text += `<p>${line}</p>`;
            }

            return text;
        };

        console.log(title, description, creator);


        if (!title || !description) {
            return res.status(400).json({
                error: true,
                message: "Missing required fields."
            });
        }

        if (!creator) {
            return res.status(401).json({
                error: true,
                message: "Unauthorized."
            });
        }

        const userDoc = await user.findOne({ token: creator });

        if (!userDoc) {
            return res.status(404).json({
                error: true,
                message: "User not found."
            });
        }


        const communityforums = await CommunityForums.create({
            title: makeNormalText(title),
            description: makeNormalText(description),
            creator: userDoc.discordId,
            comments: [],
            upvotes: [],
            downvotes: [],
            locked: false,
        });

        res.redirect(`/forum/${communityforums._id}`);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: true,
            message: "Internal server error."
        });
    }
});

communityforumsrouter.post('/comment', async (req: Request, res: Response) => {
    try {
        const { id, comment } = req.body;

        const commenter = req.cookies.token;

        if (!id || !comment || !commenter) {
            return res.status(400).json({
                error: true,
                message: "Missing required fields."
            });
        }

        const userDoc = await user.findOne({ token: commenter });

        if (!userDoc) {
            return res.status(404).json({
                error: true,
                message: "User not found."
            });
        }

        const communityforums = await CommunityForums.findById(id);

        if (!communityforums) {
            return res.status(404).json({
                error: true,
                message: "CommunityForums not found."
            });
        }

        communityforums.comments.push({
            comment,
            commenter: userDoc.discordId
        });

        await communityforums.save();

        res.json({
            error: false,
            message: "Comment added.",
            data: communityforums,
            comment: {
                avatar: userDoc.avatar,
                username: userDoc.username,
                link: `/user/${userDoc.discordId}`,
                comment,
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: true,
            message: "Internal server error."
        });
    }
});

// communityforumsrouter.post('/upvote', async (req: Request, res: Response) => {

//     try {
//         const { id } = req.body;
//         const voter = req.cookies.token;

//         if (!id || !voter) {
//             return res.status(400).json({
//                 error: true,
//                 message: "Missing required fields."
//             });
//         }

//         const userDoc = await user.findOne({ token: voter });
//         const communityforums = await CommunityForums.findById(id);

//         if (!userDoc) {
//             return res.status(404).json({
//                 error: true,
//                 message: "User not found."
//             });
//         }

//         if (!communityforums) {
//             return res.status(404).json({
//                 error: true,
//                 message: "CommunityForums not found."
//             });
//         }

//         const upvoteIndex = communityforums.upvotes.findIndex((upvote) => upvote.voter === voter);

//         if (upvoteIndex === -1) {
//             communityforums.upvotes.push(userDoc.discordId);

//             const downvoteIndex = communityforums.downvotes.findIndex((downvote) => downvote.voter === userDoc.discordId);

//             if (downvoteIndex !== -1) {
//                 communityforums.downvotes.splice(downvoteIndex, 1);
//             }

//             if (!userDoc.upvotedForums) userDoc.upvotedForums = [];

//             userDoc.upvotedForums.push({
//                 forumId: id
//             });

//             await userDoc.save();

//             await communityforums.save();
//         } else {
//             communityforums.upvotes.splice(upvoteIndex, 1);
//         }

//         res.json({
//             error: false,
//             message: "Upvote added.",
//             data: communityforums
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             error: true,
//             message: "Internal server error."
//         });
//     }

// });

// communityforumsrouter.post('/downvote', async (req: Request, res: Response) => {
//     try {
//         const { id } = req.body;
//         const voter = req.cookies.token;

//         if (!id || !voter) {
//             return res.status(400).json({
//                 error: true,
//                 message: "Missing required fields."
//             });
//         }

//         const userDoc = await user.findOne({ token: voter });
//         const communityforums = await CommunityForums.findById(id);

//         if (!userDoc) {
//             return res.status(404).json({
//                 error: true,
//                 message: "User not found."
//             });
//         }

//         if (!communityforums) {
//             return res.status(404).json({
//                 error: true,
//                 message: "CommunityForums not found."
//             });
//         }

//         const downvoteIndex = communityforums.downvotes.findIndex((downvote) => downvote.voter === userDoc.discordId);

//         if (downvoteIndex === -1) {
//             communityforums.downvotes.push(userDoc.discordId);

//             const upvoteIndex = communityforums.upvotes.findIndex((upvote) => upvote.voter === userDoc.discordId);

//             if (upvoteIndex !== -1) {
//                 communityforums.upvotes.splice(upvoteIndex, 1);
//             }

//             if (!userDoc.downvotedForums) userDoc.downvotedForums = [];

//             userDoc.downvotedForums.push({
//                 forumId: id
//             });

//             await userDoc.save();

//             await communityforums.save();
//         } else {
//             communityforums.downvotes.splice(downvoteIndex, 1);
//         }

//         res.json({
//             error: false,
//             message: "Downvote added.",
//             data: communityforums
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             error: true,
//             message: "Internal server error."
//         });
//     }
// });

communityforumsrouter.get("/comments/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                error: true,
                message: "Missing required fields."
            });
        }

        const communityforums = await CommunityForums.findById(id);

        if (!communityforums) {
            return res.status(404).json({
                error: true,
                message: "CommunityForums not found."
            });
        }

        const comments = communityforums.comments;

        const commentsTemplate = `<div class="d-flex text-muted pt-3">
        <img src="<avatar>" alt="" class="flex-shrink-0 me-2 rounded" width="32" height="32">
  
        <p class="pb-3 mb-0 small lh-sm border-bottom">
          <a href="<link>" class="d-block fw-bold text-gray-dark" target="_blank" style="text-decoration: none; color: #6c757d !important;"><strong class="d-block text-gray-dark">@<username></strong></a>
            <comment>
        </p>
      </div>`;

      const commentsMappped = comments.map(async (comment) => {
        const userDoc = await user.findOne({ discordId: comment.commenter });

        const commentTemplate = commentsTemplate
        .replace("<avatar>", userDoc?.avatar || "https://cdn.discordapp.com/embed/avatars/0.png")
        .replace("<username>", userDoc?.username || "Unknown")
        .replace("<comment>", comment.comment)
        .replace("<link>", `https://goddessanime.com/user/${userDoc?.discordId}`);

        return commentTemplate;
      });

        res.json({
            error: false,
            message: "Comments found.",
            data: await Promise.all(commentsMappped)
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: true,
            message: "Internal server error."
        });
    }
});







export default communityforumsrouter;