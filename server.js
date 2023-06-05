// Import all dependencies
const express = require('express');
const favicon = require('serve-favicon')
const cookieParser = require('cookie-parser');
const fs = require('fs');

// Try to import https, otherwise use only http
let http, is_https = false;
try {
  http = require('https');
  is_https = true;
} catch (e) {
  http = require('http');
  console.log("HTTPS is not supported, switched on HTTP");
}

// Create server
const app = express();
const server = http.createServer(is_https ? {
  key: fs.readFileSync("certificate/key.pem", 'utf8'),
  cert: fs.readFileSync("certificate/cert.pem", 'utf8'),
} : {}, app);

// Add server defaults
app.use(cookieParser());
app.use('/', express.static(__dirname + '/index'));
app.use(favicon(__dirname + '/index/icon.ico'));

// Initialize project pages array
let ProjectIndices = new Set();
let ProjectPages =
[
  ["/Fractal/Mondel.html", "?path=/Fractal/Mondel1/", "/Fractal/Mondel1/", "Mondelbrot"],
  ["/Fractal/Mondel.html", "?path=/Fractal/Mondel2/", "/Fractal/Mondel2/", "Julia"],
  ["/Fractal/Newton.html", "?path=/Fractal/Newton1/", "/Fractal/Newton1/", "Newton Classic (3rd power)"],
  ["/Fractal/Newton.html", "?path=/Fractal/Newton2/", "/Fractal/Newton2/", "Newton Classic (5rd power)"],
  ["/Fractal/Newton.html", "?path=/Fractal/Newton3/", "/Fractal/Newton3/", "Newton Classic (13rd power)"],
  ["/Fractal/Newton.html", "?path=/Fractal/Newton4/", "/Fractal/Newton4/", "Newton Sin"],
  ["/WebGPU/index.html", "?", "/WebGPU/resources/", "Web GPU"],
]
let ProjectPagesJSON = JSON.stringify(ProjectPages.map(val => { ProjectIndices.add(val[0]); return [val[0] + val[1], val[3]]; }))

// Add other pages
ProjectPages.forEach((val, ind, arr) => app.use(val[2], express.static(__dirname + val[2])));
ProjectIndices.forEach((val, ind, arr) => app.get(`${val}*`, (req, res) => res.sendFile(__dirname + val)));

// Override pages list
app.get('/list.txt*', (req, res) => {  
  res.writeHead(200);
  res.end(ProjectPagesJSON);
});

if (is_https) {
  server.listen(443, () => console.log(`main server listening on *:${443}`));

  // Add redirecting server
  require('http').createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
  }).listen(80);
} else {
  server.listen(80, () => console.log(`main server listening on *:${80}`));
}
