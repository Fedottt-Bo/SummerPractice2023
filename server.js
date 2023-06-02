// Import all dependencies
const http = require('http');
const express = require('express');
const favicon = require('serve-favicon')
const cookieParser = require('cookie-parser');

// Create server
const app = express();
const server = http.createServer(app);

// Add server defaults
app.use(cookieParser());
app.use('/', express.static(__dirname + '/index'));
app.use(favicon(__dirname + '/index/index_icon.ico'));

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

server.listen(3000, () => {
  console.log('listening on *:3000');
});
