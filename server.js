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
let ProjectPages =
[
  ["/Fractal/Mondel1/", "Mondelbrot"],
  ["/Fractal/Mondel2/", "Julia"],
  ["/Fractal/Newton1/", "Newton Classic (3rd power)"],
  ["/Fractal/Newton2/", "Newton Classic (5rd power)"],
  ["/Fractal/Newton3/", "Newton Classic (13rd power)"],
  ["/Fractal/Newton4/", "Newton Sin"],
]
let ProjectPagesJSON = JSON.stringify(ProjectPages.map(val => { return [val[0] + 'index.html', val[1]]; }))

// Add other pages
ProjectPages.forEach((val, ind, arr) => app.use(val[0], express.static(__dirname + val[0])));

// Override pages list
app.get('/list.txt', (req, res) => {  
  res.writeHead(200);
  res.end(ProjectPagesJSON);
})

server.listen(3000, () => {
  console.log('listening on *:3000');
});
