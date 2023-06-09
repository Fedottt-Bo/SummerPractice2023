// Import all dependencies
const express = require('express');
const favicon = require('serve-favicon')
const cookieParser = require('cookie-parser');
const fs = require('fs');
const { exit } = require('process');
const path = require('path');
const cors = require('cors');

// Create express app
const app = express();
app.use(cors({credentials: true, origin: true}));

let server = undefined;

// Try to import https, otherwise use only http
const http = require('http');

const try_use_https = true;
let https, is_https = false; 

if (try_use_https) {
  try {
    https = require('https');
    server = https.createServer({
      key: fs.readFileSync("certificate/key.pem", 'utf8'),
      cert: fs.readFileSync("certificate/cert.pem", 'utf8'),
    }, app);

    is_https = true;
  } catch (e) {
    https = undefined;
    is_https = false;
    
    console.log("HTTPS failed, switching on HTTP");
  }
}

if (server === undefined) {
  server = http.createServer({}, app);
}

// All requests handler
app.all('*', function (req, res, next) {
  req.on('close', () => {
    console.log(`Request from ip: '${req.ip}' with method: '${req.method}' to URL: '${req.path}' ${(res.statusCode === 200) ? 'succeeded' : `failed (code: ${res.statusCode})`}`)
  });

  next();
});

// Add server defaults
app.use(cookieParser());
app.use('/', express.static(__dirname + '/resources'));
app.use(favicon(__dirname + '/resources/icon.ico'));

// Load pages data
const Pages = JSON.parse(fs.readFileSync('pages.json'));

// Page file registring function
const registredPages = new Set();
function registerPage(page, index_path='') {
  if (page.url == undefined) throw('Missing page URL');

  // Correct URL
  let url = page.url.split('?')[0];
  if (!url.startsWith('/')) url = index_path + url;

  // Set URI if missing
  if (page.uri === undefined) page.uri = url;
  page.uri = path.join(__dirname, page.uri);

  if (!registredPages.has(url)) {
    registredPages.add(url)
    app.get('/' + url, (req, res) => res.sendFile(page.uri))
  }
}

// Resource(s) registring function
function registerResources(resource, index_path='') {  
  if (!resource.url.startsWith('/')) resource.url = '/' + index_path + resource.url;

  if (resource.uri === undefined) {
    resource.uri = resource.url;
  } else if (!resource.uri.startsWith('/')) {
    resource.uri = index_path + resource.uri;
  }
  resource.uri = path.join(__dirname, resource.uri);

  if (fs.lstatSync(resource.uri).isDirectory()) {
    app.use(resource.url, express.static(resource.uri));
  } else if (fs.lstatSync(resource.uri).isFile()) {
    app.get(resource.url, (req, res) => res.sendFile(resource.uri));
  } else {
    throw("Unknown path data");
  }
}

// Index page HTML generation function
function generateIndex(title, pages, children, parent_path=undefined) {
  let pages_tag = (pages.length > 0) ?
`<div id="ProjectsList">
  <ul>
    ${pages.join('\n')}
  </ul>
</div>` : ''

  let children_tag = (children.length > 0) ?
`<div id="ChildrenList">
  <ul>
    ${children.join('\n')}
  </ul>
</div>` : ''

  let back_button = (parent_path !== undefined) ? `<a class="ReturnButton" href="/${parent_path}">Back</a>` : ''

  let page =
`<!DOCTYPE html><html>
  <head>
    <title>${title}</title>
    <link rel="stylesheet" href="/index.css">
  </head>

  <body class="Body">
    <div id="Main" class="Main">
      <img src="http://www.gravatar.com/avatar/a3f6d0f444936204f0fddce6394862b9?size=102"  width="102" height="102">
      <span class="Handle">${title}</span><br>
      ${pages_tag}
      ${children_tag}
      <a href="https://www.school30.spb.ru/cgsg/" class="CGSGLogo"><img src="/cgsg.png"/></a>
      ${back_button}
    </div>
  </body>
</html>`

  return page;
}

// Recursive indices registring
function registerIndex(index, parent=undefined) {
  if (index === undefined) throw("Incorrect index data"); // Check object exists
  if (index._is_registred) throw("Multiple referencing is illegal"); // Avoid infinitie recursion

  if (index.path === undefined) index.path = ''
  if (index.title === undefined) index.title = 'Index page'
  if (parent !== undefined) {
    index.is_child = true
    index.path = parent.path + index.path
  } else {
    index.is_child = false
  }

  // Enumerate all pages of this index
  let pages_list = []
  if (index.pages !== undefined) index.pages.forEach(page => {
    if (page.url === undefined) throw("Incorrect page description");

    registerPage(page, index.path);
    pages_list.push(`<li><a href=\"${page.url}\" class=\"Hrefs\"> ${(page.name !== undefined) ? page.name : page.url} </a></li>`);
  })

  // Enumerate all resources
  if (index.resources !== undefined) index.resources.forEach(res => registerResources(res, index.path));

  // All general data is prepared
  index._is_registred = true;

  // Enumerate all children of this index
  let children_list = []
  if (index.children !== undefined) index.children.forEach(ind => {
    let child = Pages.indices[ind];

    registerIndex(child, index);

    children_list.push(`<li><a href=\"${child.path}\" class=\"Hrefs\"> ${child.title} </a></li>`);
  })
  
  // Create page content and register
  index.html = generateIndex(index.title, pages_list, children_list, index.is_child ? parent.path : undefined);

  app.get('/' + index.path, (req, res) => {
    res.writeHead(200);
    res.write(index.html);
    res.end();
  })
}

// Register root index
try {
  if (Pages.indices === undefined || Pages.index === undefined) throw("Incorrect indices initial data");
  registerIndex(Pages.indices[Pages.index]);
} catch (err) {
  console.error(`Failed to register indices pages:\n${err}`);
  exit(2);
}

if (is_https) {
  server.listen(443, () => console.log(`main server listening on *:${443}`));

  // Add redirecting server
  http.createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
  }).listen(80);
} else {
  server.listen(80, () => console.log(`main server listening on *:${80}`));
}
