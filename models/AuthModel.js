const mongoose = require('mongoose');

// USER SCHEMA 

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
        default: ''
    },
    tokenExpiry: {
        type: Date
    },
    todos: [{
        text: {
            type: String,
            required: true
        }
    }
    ]

});

// USER MODEL 

const User = mongoose.model('User', UserSchema);



module.exports = User

