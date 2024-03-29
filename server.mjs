import express from 'express';
import bodyParser from 'body-parser';
import Data from './data.mjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs'
import { readFileSync, readFile, writeFile, writeFileSync } from 'fs';
import { Server } from 'http'
import { Server as HttpsServer } from 'https'

import cors from 'cors'

import { v4 } from 'uuid';

const httpsEnabled = !!process.env.HTTPS

const port = process.env.PORT || (httpsEnabled ? '443' : '9736')

const sslCertificatePath = process.env.SSLPATH || process.cwd()

// const { v4: uuidv4 } = pkg;
const uuidv4 = v4;

var privateKey = readFileSync('secure/key.pem', 'utf8');
var certificate = readFileSync('secure/cert.pem', 'utf8');

var credentials = { key: privateKey, cert: certificate, passphrase: 'blue' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()

let server;

if (httpsEnabled) {
  server = new HttpsServer(
    {
      key: readFileSync(join(sslCertificatePath, 'privkey.pem')),
      cert: readFileSync(join(sslCertificatePath, 'fullchain.pem')),
    },
    app,
  )
} else {
  // server = new HttpsServer(
  //   credentials,
  //   app,
  // )
  server = new Server(app);
}

const corsOptions = {
  origin: '*',
}
app.use(cors(corsOptions))

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  // res.setHeader('Access-Control-Allow-Origin', ['http://localhost:9736','https://www.apenationcnft.com']);
  // res.setHeader('Access-Control-Allow-Origin', 'https://www.apenationcnft.com');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
const schedules = new Data();

var uuids = {}

var users = {}
readFile('./secure/users.json', 'utf8', (err, data) => {
  users = JSON.parse(data);
});

const options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now())
  }
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/build/index.html');
  console.log("GET /")
});

app.post('/auth', function (req, res) {
  // console.log(req.headers.authorization)
  if (uuids[req.headers.authorization]) {
    res.sendStatus(200)
  } else {
    res.sendStatus(401)
  }
  console.log("POST /auth")
});

app.post('/getData', function (req, res) {

  if (!uuids[req.headers.authorization]) {
    res.sendStatus(401)
    return;
  }

  let user = uuids[req.headers.authorization];

  let sched = schedules.getData(user);
  // console.log(sched)
  res.send(JSON.stringify(sched));

  // console.log("POST /getData")
});

app.post('/setData', function (req, res) {
  if (!uuids[req.headers.authorization]) {
    res.sendStatus(401)
    return;
  }
  console.log(req.body)

  let user = uuids[req.headers.authorization];

  schedules.setDataItems(user, JSON.parse(req.body.items));
  schedules.setDataThemes(user, JSON.parse(req.body.themes));
  res.sendStatus(200);

  console.log("POST /setData")
});

app.post('/login', function (req, res) {
  // res.sendFile(__dirname + '/dist/index.html');

  if (!users[req.body.user]) {
    res.sendStatus(400);
    return;
  }

  if (users[req.body.user].hash === req.body.pass) {
    var genuuid = uuidv4();
    uuids[genuuid] = req.body.user;
    console.log(genuuid);
    console.log(Object.keys(uuids));

    setTimeout(() => {
      console.log("session " + genuuid + " has expired!")
      delete uuids[genuuid];
      console.log(Object.keys(uuids))
    }, 300000);
    res.send(genuuid)
    return;
  } else {
    res.sendStatus(400);
  }
});

app.post('/signup', function (req, res) {
  if (users[req.body.user]) {
    res.sendStatus(400);
    return;
  }

  let newUser = { "hash": req.body.pass }
  users[req.body.user] = newUser;

  console.log("POST /signup")
  res.sendStatus(200);

  var jsonS = JSON.stringify(users);
  writeFile('secure/users.json', jsonS, (err) => {
    if (err) throw err;
    console.log('The data has been saved!');
  });
});

app.use(express.static('build', options))

// var httpsServer = https.createServer(credentials, app);
// httpsServer.listen(443)
// console.log('listening on port 443');

server.listen(port)
console.log('listening on port: ' + port)
// console.log('listening on port 5000');

// console.log(bcrypt.hashSync("4uBRxb5Y66DFPb5", bcrypt.genSaltSync()))
// console.log(bcrypt.hashSync("testing", bcrypt.genSaltSync()))