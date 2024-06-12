const User = require('../models/user');
const bcrypt = require('bcrypt');

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });

        if (!user) {
            req.flash('error', 'Email not existed');
            return res.redirect('/login');
        }

        const userPass = user.password;
        const validPassword = await bcrypt.compare(password, userPass);

        if (!validPassword) {
            req.flash('error', 'Password is incorrect');
            return res.redirect('/login');
        } else {
            req.session.user = user;
            res.redirect('/');
        }
    } catch (error) {
        console.error('Error during login:', error);
        req.flash('error', 'An error occurred during login');
        res.redirect('/login');
    }
};

module.exports = login;


const checkEmailExisted = async ({ email }) => {
    const user = await User.findOne({ email: email });
    return user ? true : false;
};

const signUp = async (req, res, next) => {
    console.log(req.body)

    // Check if email already exists
    if (await checkEmailExisted(req.body)) {
        req.flash('error', 'Email already existed')
        return res.redirect('/sign-up')
    } else {

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create a new user with the hashed password
        const newUser = new User({
            ...req.body,
            password: hashedPassword,
            googleId: null,
        });

        try {
            await newUser.save();
            res.redirect('/login');  // Redirect to login or another page after successful signup
        } catch (error) {
            next(error);  // Pass any errors to the error handler
        }
    }
};

module.exports = { login, signUp };
