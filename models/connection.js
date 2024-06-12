const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/authenticate')
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });
module.exports = mongoose