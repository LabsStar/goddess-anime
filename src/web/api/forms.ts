import { Request, Response, Router } from 'express';
import beta from '../../models/Forms/beta';
import guild from '../../models/guild';

const formsrouter = Router();

const formTypes = ["beta"];

formsrouter.get('/case/:formType?/:cId?', async (req: Request, res: Response) => {
    const caseId = req.params.cId;
    const formType = req.params.formType;
    
    if (!caseId || !formType) return res.status(400).json({ success: false, message: "Missing required fields. (caseId, formType)" });

    // Check if the form type is valid.
    if (!formTypes.includes(formType)) return res.status(400).json({ success: false, message: `Invalid form type. Valid form types: ${formTypes.join(", ")}` });

    // Check if the case id is valid. (MongoDB ID)
    if (caseId.length !== 24) return res.status(400).json({ success: false, message: "Invalid case id. Please make sure you are using the correct case id. If you are wondering what a case id looks like, here is an example: 60a7b1b0e6b3b5b4e0b3b5b4 (https://www.mongodb.com/docs/manual/reference/method/ObjectId)" });

    
    switch (formType) {
        case "beta": {
            const form = await beta.findById(caseId);

            if (!form) return res.status(404).json({ success: false, message: "Form not found." });

            return res.status(200).json({ success: true, message: "Form found.", data: form });
        }
        default: {
            return res.status(400).json({ success: false, message: `Invalid form type. Valid form types: ${formTypes.join(", ")}` });
        }
    }



});

formsrouter.post("/beta", async (req: Request, res: Response) => {
    const { serverId, userId, reason } = req.body;

    if (!serverId || !userId || !reason) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    // Check if the user has already submitted a form.
    const form = await beta.findOne({ serverId, userId });

    if (form) return res.status(400).json({ success: false, message: "You have already submitted a form." });

    // Check if the server exists.
    const guildsDoc = await guild.findOne({ guildId: serverId });

    if (!guildsDoc) return res.status(400).json({ success: false, message: `It seems the bot is not in your server. Please add the bot to your server and try again.` });

    try {
        const newForm = new beta({ serverId, userId, reason });
        await newForm.save();

        return res.status(200).json({ success: true, message: `Form submitted successfully. Case ID: ${newForm._id}` });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }

});


formsrouter.get('*', (req: Request, res: Response) => {
    return res.status(404).json({ success: false, message: "Invalid endpoint." });
});

formsrouter.post('*', (req: Request, res: Response) => {
    return res.status(404).json({ success: false, message: "Invalid endpoint." });
});

formsrouter.put('*', (req: Request, res: Response) => {
    return res.status(404).json({ success: false, message: "Invalid endpoint." });
});

formsrouter.delete('*', (req: Request, res: Response) => {
    return res.status(404).json({ success: false, message: "Invalid endpoint." });
});

formsrouter.patch('*', (req: Request, res: Response) => {
    return res.status(404).json({ success: false, message: "Invalid endpoint." });
});


export default formsrouter;
