import { Request, Response, Router } from 'express';
import packageJson from '../../../package.json';
import { convertCircular, JSON_TO_XML } from '../../utils/gtoFile';

const componentsrouter = Router();

componentsrouter.get('*', (req: Request, res: Response) => {
    const { version, name, repository, license, bugs, homepage } = packageJson;

    const JSON_PAYLOAD = {
        error: false,
        message: `Currently in development. Please check the documentation at https://docs.goddessanime.com/web-apis/components`,
        data: {
            version,
            name,
            repository,
            license,
            bugs,
            homepage,
        },
        timestamp: Date.now(),
        ip: req.socket.remoteAddress || req.socket.localAddress,
        method: req.method,
        url: req.url,
        body: convertCircular(req.body),
        query: req.query,
        params: req.params,
        headers: req.headers,
    };

    if (req.headers['content-type'] === 'application/xml' || req.headers['accept'] === 'application/xml' || req.query.format === 'xml') {
        res.type('application/xml');
        res.status(501).send(JSON_TO_XML(JSON_PAYLOAD, 'request'));
    } else {
        res.status(501).json(JSON_PAYLOAD);
    }
});

export default componentsrouter;
