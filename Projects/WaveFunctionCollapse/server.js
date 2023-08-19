const http = require('http');
const fs = require('fs');
const path = require('path');

http.createServer(function (req, res) {
    const filePath = path.join(__dirname, req.url);
    console.log(filePath);
    if (!fs.existsSync(filePath)) { return; }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    let readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
}).listen(8080);