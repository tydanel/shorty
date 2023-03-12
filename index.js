import Http from 'http';
import qs from 'querystring';
import Fs from 'fs/promises';

const NOT_ALLOWED = [
    'register',
    'prototype',
    '__proto__'
];


class DB extends Map {
    #path = null;

    constructor({ path })
    {
        super();
        this.#path ||= path;
    }
    toArray() {
        return Array.from(this.entries());
    }
    fromArray(array) {
        for ( const [key,value] of array ) {
            this.set(key, value);
        }
    }
    hasValue(value) {
        return Array.from(this.values()).find(v => v === value);
    }
    set(key, value) {
        // No duplicate urls or keys
        if ( !this.hasValue(value) && !this.has(key) ) {
            super.set(key, value);
        }
    }
    async save() {
        await Fs.writeFile(this.#path, JSON.stringify(this.toArray()));
        console.log(Array.from(this.entries()))
    }
    async load() {
        const rawData = await Fs.readFile(this.#path);
        const data = JSON.parse(rawData.toString());
        this.fromArray(data);
    }
}
const map = new DB({ path: 'data.json' });
await map.load()

const server = Http.createServer(async (req, res) => {
    const url = req.url.substring(1);
    const [path, queryStr] = url.split('?');
    const query = qs.parse(queryStr);
    if ( path === '' ) {
        res.writeHead(200, {
            'Content-Type':'text/html'
        })
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
    if ( path === 'register' ) {
        if ( !query.short || !query.url ) {
            res.writeHead(401)
            return res.end('Nope');
        }
        if ( NOT_ALLOWED.includes(query.short) ) {
            res.writeHead(401);
            return res.end('Bad short code.');
        } else if ( map.has(query.short) ) {
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
    
    if ( map.has(path) ) {
        res.writeHead(307, {
            'Location': `${map.get(path)}`
        });
        return res.end();
    }
    
    res.writeHead(404);
    return res.end(`Not Found (${req.url})`);
});


server.listen(3303, 'localhost', (error) => {
    if ( error ) throw error;
    console.log('Listening for requests');
});

 