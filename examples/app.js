/**
 * Module Dependencies.
 */
var express = require('express'),
    passport = require('passport'),
    StackExchangeStrategy = require('../lib').Strategy,
    morgan = require('morgan'), // logger
    session = require('express-session'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

/**
 * Configurations.
 */
var STACK_EXCHANGE_APP_ID = '5178', // '*** YOUR APP ID (CLIENT ID) ***',
    STACK_EXCHANGE_APP_SECRET = '6128bPZiGy1MJMljuk2AKw((', //'*** YOUR APP SECRET (CLIENT SECRET) ***',
    STACK_EXCHANGE_APP_KEY = 'F*Pw8ft3xA1H1bK0kG6Y2g((';


/**
 * Passport session setup
 */
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});



/**
 * Use the StackExchangeStrategy within Passport
 */
passport.use(new StackExchangeStrategy({
        clientID: STACK_EXCHANGE_APP_ID,
        clientSecret: STACK_EXCHANGE_APP_SECRET,
        callbackURL: 'http://www.lvh.me:3000/auth/stack-exchange/callback',
        stackAppsKey: STACK_EXCHANGE_APP_KEY,
        site: 'stackoverflow'
    },
    function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // To keep the example simple, the user's Facebook profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Facebook account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
        });
    }
));



/**
 * Configure Express
 */
var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(morgan());
app.use(cookieParser());
app.use(bodyParser());
app.use(session({secret: 'keyboard cat'}));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res){
    res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
    res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
    res.render('login', { user: req.user });
});

app.get('/auth/stack-exchange',
    passport.authenticate('stack-exchange'));

app.get('/auth/stack-exchange/callback',
    passport.authenticate('stack-exchange', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    });

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.listen(3000);



function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}