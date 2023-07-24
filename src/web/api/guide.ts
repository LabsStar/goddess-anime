import { Request, Response, Router } from 'express';
import user from '../../models/user';
import guides from '../../models/guides';
import { formatNumber } from '../../utils/generate';

const guiderouter = Router();

guiderouter.post('/comment', async (req: Request, res: Response) => {
    const { comment, guide_slug } = req.body;
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({
            error: true,
            message: 'Unauthorized',
        });
    }

    if (!comment || !guide_slug) {
        return res.status(400).json({
            error: true,
            message: 'Missing required parameters',
        });
    }

    const guide = await guides.findOne({ slug: guide_slug });
    const userDoc = await user.findOne({ token: token });

    if (!guide) {
        const newGuide = new guides({
            slug: guide_slug,
            comments: [{
                text: comment,
                user: userDoc?.discordId,
            }],
            views: 0,
        });

        await newGuide.save();
    }

    if (guide) {

        // Check if user has already commented
        const userComment = guide.comments.find((c) => c.user === userDoc?.discordId);

        if (userComment) {
            return res.status(400).json({
                error: true,
                message: 'User has already commented',
            });
        }

        guide.comments.push({
            text: comment,
            user: userDoc?.discordId,
        });

        await guide.save();
    }

    return res.status(200).json({
        error: false,
        message: 'Comment posted',
        user: userDoc,
        text: comment,
    });

});

guiderouter.post("/update-views", async (req: Request, res: Response) => {
    const { guide_slug } = req.body;

    if (!guide_slug) {
        return res.status(400).json({
            error: true,
            message: 'Missing required parameters',
        });
    }

    const guide = await guides.findOne({ slug: guide_slug });

    if (!guide) {
        return res.status(404).json({
            error: true,
            message: 'Guide not found',
        });
    }

    // Use optional chaining to safely access the 'views' property
    guide.views = (guide.views || 0) + 1;

    await guide.save();

    return res.status(200).json({
        error: false,
        message: 'Views updated',
        views: formatNumber(guide.views || 0),
    });
});

export default guiderouter;
