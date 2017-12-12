/**
 *Configure some env. var.
 */
require('dotenv').config();

var express         = require('express');
var fs              = require('fs');
var path            = require('path');
var favicon         = require('serve-favicon');
var logger          = require('morgan');
var bodyParser      = require('body-parser');
var helmet          = require('helmet');
var cookieSession   = require('cookie-session');
var cookieParser    = require('cookie-parser');
var mongoose        = require('mongoose');
var passport        = require('passport');
var flash           = require('connect-flash');
var requestIp       = require('request-ip');
var config          = require('config');
var moment          = require("moment");
var util            = require("util");
var _               = require("lodash");


var env = process.env.NODE_ENV || 'development'; //development    //production    //stage

var app = express();

/***************** GLOBALS ******************/
//moment on app
app.locals.moment = moment;
moment.locale("en");

app.locals.util = util;
app.locals._    = _;

/*******************************************/

//force Http status 200 instead of 304 coz of express cache
app.disable('etag');

// configure database
require('./config/database')(app, mongoose);

// bootstrap data models (./../models...)
fs.readdirSync(__dirname + '/models').forEach(function (file) {
    if (~file.indexOf('.js')) require(__dirname + '/models/' + file);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieSession({
  name: 'session',
  keys: [config.get('Cookie.session.secret1'),config.get('Cookie.session.secret2')]
}));

//server proctection
app.use(helmet());
//get client Ip
app.use(requestIp.mw());

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
//bodyParser for request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); //support encoded body
//session + flash
app.use(cookieParser(config.get('Cookie.parser.secret')));
app.use(flash());
//passport
require('./config/passport')(app, passport);
app.use(passport.initialize());
app.use(passport.session());

//add timestamps in front of log messages
require('console-stamp')(console, '[HH:MM:ss.l]');
//since logger only returns a UTC version of date, I'm defining my own date format - using an internal module from console-stamp
/*
logger.format('mydate', function() {
    var df = require('console-stamp/node_modules/dateformat');
    return df(new Date(), 'HH:MM:ss.l');
});
app.use(logger('[:mydate] :method :url :status :res[content-length] - :remote-addr - :response-time ms'));
*/


//console.log('MONGO_URI: ' + process.env.MONGO_URI);
//console.log(process.env);


/*********  CONFIGURE ROUTES   *************/
var routes =    require('./routes/index');
var home =      require('./routes/home');
var login =     require('./routes/login');
var register =  require('./routes/register');
var users =     require('./routes/users');
var chars =     require('./routes/chars');
var admin =     require('./routes/admin');
var applys =    require('./routes/applys');
var weakaura =  require('./routes/weakaura');
var settings =  require('./routes/settings');
var profile =   require('./routes/profile');
var roster =    require('./routes/roster');
var wlogs =     require('./routes/wlogs');
var forgot =    require('./routes/forgot');
var reset =     require('./routes/reset');
var infos =     require('./routes/infos');


app.use('/', routes);
app.use('/home', home);
app.use('/login', login);
app.use('/register', register);
app.use('/users', users);
app.use('/chars', chars);
app.use('/admin', admin);
app.use('/applys', applys);
app.use('/weakaura', weakaura);
app.use('/settings', settings);
app.use('/profile', profile);
app.use('/roster', roster);
app.use('/wlogs', wlogs);
app.use('/forgot', forgot);
app.use('/reset', reset);
app.use('/infos', infos);


//********  TEST
var test_addApply = require('./routes/test_addApply');

app.use('/test_addApply', test_addApply);

/******************************************/

// configure error handlers
require('./config/errorHandlers.js')(app);


module.exports = app;
