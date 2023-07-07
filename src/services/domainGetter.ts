import axios from "axios";

const isDev = process.env.node_mode;

const getEndpoint = () => {
    if (isDev == "dev") return "http://localhost/api";
    else return "https://goddessanime.com/api";
}

async function getuser(u: string, host: string, req: any, res: any) {

    if (!u) return res.redirect(getEndpoint());

    console.log(u)

    try {
        const { data } = await axios.get(`${getEndpoint()}/social-name/${u}`);

        console.log(data)

        if (data.error) return res.redirect(getEndpoint().replace("/api", ""));

        if (data.data.domain !== host) return res.redirect(getEndpoint().replace("/api", ""));

        return res.redirect(`${getEndpoint().replace("/api", "")}/user/${data.data.id}`)
    } catch (error) {
        return res.status(500).json({
            error: (error as Error).message,
            status: 404,
            params: req.params,
            query: req.query
        })
    }
    
}


export default getuser