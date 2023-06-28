const User = require('../models/AuthModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

require('dotenv').config();

const jwtKey = process.env.JWT_KEY;
const userEmail = process.env.USER_EMAIL;
const userPassword = process.env.USER_PASSWORD;

// Reset password mail function 

const resetPasswordMail = async (name, email, token) => {

    try {

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: userEmail,
                pass: userPassword
            }
        });

        const mailOptions = {
            from: userEmail,
            to: email,
            subject: 'for reset the password',
            html: `<p>Hello ${name} please copy the link <a href="https://auth-todo-app.netlify.app/reset-password/${token}">reset your password</a> this link is valid for only 5 minute</p>`
        }

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err)
            } else {
                console.log('Mail has been sent :', info.response)
            }
        });

    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error
        })
    }
}

// Register the user 

module.exports.setRegister = async (req, res) => {

    try {

        // Check first the user is registered 

        const { name, email, password } = req.body;

        // Validate input fields 

        if (!name || !email || !password) {
            res.status(200).json({
                status: "user-field-error",
                message: "Please fill all required fields"
            })
        };

        // Validate existing user 

        const userEmail = await User.findOne({
            email
        })

        if (userEmail) {
            res.status(200).json({
                status: 'user-error',
                message: 'Username already existed'
            })
        }

        // Create a new user with hash password 

        const newPassword = await bcrypt.hash(password, 10);


        await User.create({
            name, email, password: newPassword
        })

        res.status(201).json({
            status: 'ok',
            message: "Registration successful"
        })
    } catch (err) {
        res.status(400).json({ status: 'error', message: err });
    }


}

// Login user


module.exports.setLogin = async (req, res) => {

    try {


        // Check the user with email

        const userData = await User.findOne({
            email: req.body.email,
        })

        // If not a user 

        if (!userData) {
            res.status(200).json({
                status: 'user-invalid-error',
                message: 'Invalid Username'
            })
        }

        // Check user with password 

        const isPasswordValid = await bcrypt.compare(req.body.password, userData.password);

        // Create a jwt token 

        const token = await jwt.sign({
            name: userData.name,
            email: userData.email
        }, jwtKey)


        // If password matched then login the user and set the token 

        if (isPasswordValid) {
            return res.status(200).json({
                status: 'ok',
                message: 'Login successful',
                userData: token
            })
        } else {
            return res.json({
                status: 'user-pass-error',
                message: 'password not valid',
                userData: false
            })
        }
    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err

        })
    }

}

// Forgot password 

module.exports.forgotPassword = async (req, res) => {

    try {

        // Get email and check the user 

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            res.status(200).json({
                status: 'user-err',
                message: 'User not found',

            })
        }

        // Create a token and token expiry add to the user   


        const newToken = randomstring.generate();

        const tokenExpiry = Date.now() + 5 * 60 * 1000;


        const setToken = await User.findByIdAndUpdate({ _id: user._id }, { $set: { token: newToken, tokenExpiry } }, { new: true });

        console.log(setToken)

        // Call the nodemailer function 

        resetPasswordMail(setToken.name, setToken.email, setToken.token)

        res.status(200).json({
            status: 'ok',
            message: 'password reset link has been sent in your mail',

        })


    } catch (err) {
        res.status(400).json({
            status: 'error',
            message: err

        })
    }
}

// Reset password page 

module.exports.resetPasswordPage = async (req, res) => {

    try {
        // Get the token from params and check the user 

        const { token } = req.params;

        const tokenData = await User.findOne({ token, tokenExpiry: { $gt: Date.now() } });

        if (!tokenData) {
            res.status(200).json({
                status: 'token-error',
                message: 'link has been expired',

            })
        }

        res.status(200).json({
            status: 'token-verified',
            message: 'User is valid',

        })

    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error

        })
    }
}

// Set new password 

module.exports.resetPassword = async (req, res) => {

    // Get the token and check the user is valid

    try {

        const { token } = req.params;
        const tokenData = await User.findOne({ token, tokenExpiry: { $gt: Date.now() } });

        if (!tokenData) {
            res.status(200).json({
                status: 'token-error',
                message: 'link has been expired',

            })
        }

        // Get the password and create a new password and delete the token

        const { password } = req.body;

        const newPassword = await bcrypt.hash(password, 10);

        await User.findByIdAndUpdate({ _id: tokenData._id }, { $set: { password: newPassword, token: '' } }, { new: true });
        res.status(200).json({
            status: 'ok',
            message: 'Password has been updated',

        })

    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error

        })
    }
}

// Get todo

module.exports.getToDo = async (req, res) => {

    try {

        // Get email from authMiddleware 

        const email = req.email;

        //  find the user and get the todo

        const user = await User.findOne({ email });

        console.log(user)

        return res.json({
            status: 'ok',
            message: 'get todo',
            todo: user.todos,
            user: user.name
        })

    } catch (err) {

        res.json({
            status: 'error',
            message: err
        })
    }

}

// Create todo

module.exports.saveToDo = async (req, res) => {

    try {

        // Get text from body and email from auth and create todo 

        const { text } = req.body;

        const email = req.email;

        const todo = await User.findOneAndUpdate({ email }, { $push: { todos: { text } } }, { new: true });



        return res.json({
            status: 'ok',
            message: 'added todo',
            todo: todo
        })

    } catch (err) {
        return res.json({
            status: 'error',
            message: err
        })
    }
}

// Delete todo

module.exports.deleteToDo = async (req, res) => {

    try {

        // Get id from body and email from auth to delete todo 

        const { _id } = req.body;
        const email = req.email;

        await User.findOneAndUpdate({ email }, { $pull: { todos: { _id } } }, { new: true });

        res.json({
            status: 'error',
            message: 'todo item is deleted successfully'
        })

    } catch (err) {
        return res.json({
            status: 'error',
            message: err
        })
    }

}

// Update todo

module.exports.updateToDo = async (req, res) => {

    try {

        // Get id ,text from body and email from auth to update todo 

        const { _id, text } = req.body;
        const email = req.email;


        await User.findOneAndUpdate({ email, 'todos._id': _id }, { $set: { 'todos.$.text': text } }, { new: true });

        return res.json({
            status: 'error',
            message: 'todo item is updated successfully'
        })

    } catch (err) {
        return res.json({
            status: 'error',
            message: err
        })
    }



}