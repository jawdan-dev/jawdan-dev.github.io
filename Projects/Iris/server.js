const http = require('http');
const fs = require('fs');
var path = require('path');

http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath == './') filePath = './index.html';


    let extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.csv': contentType = 'text/csv'; break;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end();
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data, 'utf-8');

            console.log("sent stuff:", filePath, contentType)
        }
    });
}).listen(8080);