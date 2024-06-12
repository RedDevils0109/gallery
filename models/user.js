const mongoose = require('./connection');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    googleId: {
        type: String,
    },
    name: {
        type: String,
        required: function () {
            return !this.googleId;
        }
    },
    image: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        }
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
