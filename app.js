const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const util = require('util');
const mime = require('mime');

const config = require('./config');

http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);
    let urlObj = url.parse(req.url);
    let file = path.join('./public', urlObj.pathname);
    fs.stat(file, (err, stats) => {
        if (err) return errRes(res);
        if (!stats.isFile()) return errRes(res);
        console.log(stats.size);
        fs.access(file, fs.constants.R_OK, (err) => {
            if (err) return errRes(res);
            let r = fs.createReadStream(file);
            r.on('error', (err) => {
                return errRes(res);
            });
            res.writeHead(200, {
                'Content-Type': mime.lookup(file),
                'Content-Length': stats.size
            });
            r.pipe(res);
        });
    });
}).listen(config.server.port, config.server.host, (err) => {
    if (err) throw err;
    console.log(`server started on ${config.server.host}:${config.server.port}`);
});

function errRes(res) {
    let body = 'no such page';
    res.writeHead(404, {
        'Content-Type': 'text/plain',
        'Content-Length': Buffer.byteLength(body)
    });
    res.end(body);
}