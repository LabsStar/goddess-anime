import { Request, Response, Router } from 'express';
import User from '../../models/user';

const usersrouter = Router();

const ITEMS_PER_PAGE = 10;


usersrouter.get('/paginated', async (req: Request, res: Response) => {
    const { page, limit } = req.query;

    // Convert the query parameters to numbers, with default values if not provided
    const pageNumber = parseInt(page as string) || 1;
    const itemsPerPage = parseInt(limit as string) || ITEMS_PER_PAGE;

    try {
        // Find the total number of users in the database
        const totalUsers = await User.countDocuments();

        // Calculate the total number of pages based on the itemsPerPage
        const totalPages = Math.ceil(totalUsers / itemsPerPage);

        // Determine the skip value based on the current page number and itemsPerPage
        const skip = (pageNumber -1 ) * itemsPerPage;

        // Fetch the users for the current page using pagination
        const users = await User.find({}).skip(skip).limit(itemsPerPage);

        return res.json({
            page: pageNumber,
            totalPages: totalPages,
            users: users,
        });
    } catch (err) {
        console.error('Error fetching paginated users:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

usersrouter.get('/search', async (req: Request, res: Response) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ error: 'Missing username parameter' });
    }

    try {
        const users = await User.find({ username: { $regex: username as string, $options: 'i' } });

        return res.json(users);
    } catch (err) {
        console.error('Error searching for users:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

usersrouter.get('/@me', async (req: Request, res: Response) => {
    const getToken = () => {
        if (req.headers["authorization"]) {
            return req.headers["authorization"];
        }
        else if (req.cookies.token) {
            return req.cookies.token;
        } else {
            return null;
        }
    };

    const token = getToken();

    if (!token) return res.redirect('/login');

    try {
        const user = await User.findOne({ token: token });

        if (!user) return res.redirect('/login');

        return res.redirect(`/user/${user.discordId}`);
    } catch (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
    
});

export default usersrouter;
