import axios from "axios";

const isDev = process.env.node_mode;
const getEndpoint = () => (isDev === "dev" ? "http://localhost/api" : "https://goddessanime.com/api");

async function getuser(u: string, host: string, req: any, res: any) {
  if (!u) return res.redirect(getEndpoint());

  try {
    const { data } = await axios.get(`${getEndpoint()}/social-name/${u}`);

    if (data.error) return res.redirect(getEndpoint().replace("/api", ""));
    if (data.data.domain !== host) return res.redirect(getEndpoint().replace("/api", ""));

    return res.redirect(`${getEndpoint().replace("/api", "")}/user/${data.data.id}`);
  } catch (error) {
     return res.redirect(`${getEndpoint().replace("/api", "/error")}`);
  }
}

export default getuser;
