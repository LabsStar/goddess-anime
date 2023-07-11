import axios from "axios";

const createResponse = (type: string, tag: string) => {
    return axios.get(`https://api.waifu.pics/${type}/${tag}`).then((res) => {
        return res.data.url;
    });
}

export function getWaifu(tag: string) {
    return createResponse('sfw', tag);
}

export function getNSFWWaifu(tag: string) {
    return createResponse('nsfw', tag);
}