import Http from 'http';
import qs from 'querystring';
import DB from './store.js';

const NOT_ALLOWED = [
    'register',
    'prototype',
    '__proto__'
];

const map = new DB({ path: 'data.json' });
await map.load()

const server = Http.createServer(async (req, res) => {
    const url = req.url.substring(1);
    const [path, queryStr] = url.split('?');

    if (path === '') {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        return res.end(`
        <form action="register" method="GET">
        <input name="url">
        <br>
        <input name="short">
        <br>
        <button>Submit</button>
        </form>
        `);
    }
    if (path === 'register') {
        const query = qs.parse(queryStr);

        if (!query.short || !query.url) {
            res.writeHead(401)
            return res.end('Nope');
        }
        if (NOT_ALLOWED.includes(query.short)) {
            res.writeHead(401);
            return res.end('Bad short code.');
        } else if (map.has(query.short)) {
            res.writeHead(401);
            return res.end('Short code exists.');
        } else {
            map.set(query.short, query.url);
            await map.save();
        }


        res.writeHead(200);
        res.write('Registered');
        return res.end();

    }

    if (map.has(path)) {
        res.writeHead(307, {
            'Location': `${map.get(path)}`
        });
        return res.end();
    }

    res.writeHead(404);
    return res.end(`Not Found (${req.url})`);
});


server.listen(3303, 'localhost', (error) => {
    if (error) throw error;
    console.log('Listening for requests');
});

