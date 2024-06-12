module.exports = (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        req.flash('error', 'Please login ')
        res.redirect('/login')
    }
}