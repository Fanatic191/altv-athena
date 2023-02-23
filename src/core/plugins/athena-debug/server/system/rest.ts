import * as Athena from '@AthenaServer/api';
import * as alt from 'alt-server';
import http from 'http';
import { DebugKeys } from './keys';

const port = 7790;

let server: http.Server;

function toJSON(data: any): string {
    return JSON.stringify(data, null, '\t');
}

const InternalFunctions = {
    async post(req: http.IncomingMessage, res: http.ServerResponse) {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });

        await new Promise((resolve: Function) => {
            req.on('end', () => {
                resolve();
            });
        });

        // do something with body here...

        res.writeHead(200, 'okay');
        return res.end('Got it. Thanks.');
    },
    response(req: http.IncomingMessage, res: http.ServerResponse) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
        res.setHeader('Access-Control-Max-Age', 60 * 60 * 24 * 30);

        if (req.method === 'POST') {
            return InternalFunctions.post(req, res);
        }

        if (req.method !== 'GET') {
            return res.end(toJSON({ error: http.STATUS_CODES[405] }));
        }

        if (typeof InternalFunctions[req.url] !== 'function') {
            return res.end(toJSON({ error: http.STATUS_CODES[405] }));
        }

        return InternalFunctions[req.url](res);
    },
    '/': (res: http.ServerResponse) => {
        return res.end(toJSON({ routes: Object.keys(InternalFunctions).filter((x) => x !== 'response') }));
    },
    '/players': (res: http.ServerResponse) => {
        const players = Athena.get.players.online().map((player) => {
            return {
                id: player.id,
                pos: player.pos,
                rot: player.rot,
                vehicle: player.vehicle,
                armour: player.armour,
                hp: player.health,
                model: player.model,
                ...player,
            };
        });

        return res.end(toJSON(players));
    },
    '/vehicles': (res: http.ServerResponse) => {
        const vehicles = [...alt.Vehicle.all]
            .filter((x) => x && x.valid && x.data && x.data._id)
            .map((vehicle) => {
                return {
                    id: vehicle.id,
                    pos: vehicle.pos,
                    rot: vehicle.rot,
                    bodyHealth: vehicle.bodyHealth,
                    engineHealth: vehicle.engineHealth,
                    model: vehicle.model,
                    ...vehicle,
                };
            });

        return res.end(toJSON(vehicles));
    },
    '/update': (res: http.ServerResponse) => {
        let result = DebugKeys.getLastPosition();
        return res.end(toJSON(result));
    },
    '/memory': (res: http.ServerResponse) => {
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        return res.end(toJSON(used));
    },
};

const RestServiceConst = {
    init() {
        if (!server) {
            server = http.createServer(InternalFunctions.response);
            server.listen(port, () => {
                alt.log(`~c~REST Server: ~lg~http://localhost:${port}`);
            });
        }
    },
};

export const RestService = {
    ...RestServiceConst,
};
