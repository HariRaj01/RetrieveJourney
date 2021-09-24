import * as express from "express";
import * as compression from "compression";  // compresses requests
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as path from "path";
import * as favicon from "serve-favicon";
import * as session from "express-session";
// import SfmcApiDemoRoutes from './SfmcApiDemoRoutes';
import SfmcAppDemoRoutes from './SfmcAppDemoRoutes';
import Utils from './Utils';

const PORT = process.env.PORT || 5000

// Create & configure Express server
const app = express();

// Express configuration
app.set("port", PORT);
app.set("views", path.join(__dirname, "../views"));
app.set('view engine', 'ejs');

// Use helmet. More info: https://expressjs.com/en/advanced/best-practice-security.html
var helmet = require('helmet')
app.use(helmet());
// Allow X-Frame from Marketing Cloud. Sets "X-Frame-Options: ALLOW-FROM http://exacttarget.com".
app.use(helmet.frameguard({
    action: 'allow-from',
    domain: 'http://exacttarget.com'
  }))

app.use(session({
    name: 'server-session-cookie-id',
    secret: 'sanagama-df18',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup static paths
app.use(express.static(path.join(__dirname, "../static")));
app.use(favicon(path.join(__dirname,'../static','images','favicons', 'favicon.ico')));

// Routes: pages
app.get("/", function (req, res) {
  if (req.query.code === undefined) {
    const redirectUri = `https://${process.env.BASE_URL}.auth.marketingcloudapis.com/v2/authorize?response_type=code&client_id=${process.env.CLIENTID}&redirect_uri=${process.env.REDIRECT_URL}`;

    res.redirect(redirectUri);
  } else {
    res.render("apidemo.ejs", {
      authorization_code: req.query.code,
      tssd: req.query.tssd ? req.query.tssd : process.env.BASE_URL,
    });
  }
});
 app.post('/appdemo', function(req, res) { Utils.initSampleDataAndRenderView(req, res, 'appdemo.ejs') });
const appDemoRoutes = new SfmcAppDemoRoutes();  

// Routes: called when this demo app runs as a Marketing Cloud app in an IFRAME in the Marketing Cloud web UI
  app.post('/appdemoauthtoken', function(req, res) {
  appDemoRoutes.getOAuthAccessToken(req, res); }); 

  app.post("/appuserinfo", function (req, res) {
    appDemoRoutes.appUserInfo(req, res);
  });
  
  app.post("/getJourneysById", function (req, res) {
    appDemoRoutes.getJourneysById(req, res);
  });
  
  app.post("/getactivityById", function (req, res) {
    appDemoRoutes.getactivityById(req, res);
  });

module.exports = app;