const express = require('express')
const app = express()
const path = require('path');
require('dotenv').config();
const ejsMate = require('ejs-mate');
const session = require('express-session')
const flash = require('connect-flash');
const passport = require('passport');
const multer = require('multer');
const methodOverride = require('method-override');


const User = require('./models/user')
const Gallery = require('./models/gallery')
const { login, signUp } = require('./controllers/users')
const authorize = require('./middleware/authorize')
const catchAsync = require('./middleware/catchAsync')
const isLogin = require('./middleware/isLogin')
const { storage, cloudinary } = require('./cloudinary/index');
const folderRoute = require('./routes/folder')

const upload = multer({ storage })
require('./config/passport-setup');

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'));
const port = process.env.PORT


app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(session({
    secret: process.env.SESSION_SECRET, // Session secret from environment variables
    resave: false, // Do not resave session if unmodified
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    },
}));

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session()); // Use passport to manage sessions
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
app.use(authorize)


app.get('/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'] // Request access to profile and email
    })
);

// Define the callback route for Google to redirect to after authentication
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }), // Redirect to login on failure
    (req, res) => {
        // Successful authentication, redirect to the home page
        req.session.user = req.user; // Set the authenticated user in session
        res.redirect('/');
    }
);
app.get('/', isLogin, (req, res) => {

    res.render('pages/home')

})

app.use('/gallery', folderRoute)



app.get('/login', (req, res) => {
    res.render('pages/login')
})
app.post('/login', catchAsync(login))
app.get('/sign-up', (req, res) => {
    res.render('pages/sign-up')
})
app.post('/sign-up', catchAsync(signUp))

app.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }
            res.clearCookie('connect.sid');
            res.redirect('/')

        });
    });
});

app.all('*', (req, res, next) => {
    next(new Error('Page Not Found', 404))
})

app.use(function (err, req, res, next) {
    const { statusCode = 500, message = 'Internal Server Error' } = err;
    res.status(statusCode).render('pages/error', { err: err });
});

app.listen(port, () => {
    console.log(`LISTENNING ON ${port}`)
})
