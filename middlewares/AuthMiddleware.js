const jwt = require('jsonwebtoken');

require('dotenv').config();

const jwtKey = process.env.JWT_KEY;

// Authentication middleware 

const authMiddleware = async (req, res, next) => {

    // get the token from header 

    const token = req.headers['x-access-token'];

    if (!token) {
        return res.status(401).json({
            message: 'no token'
        })
    }

    try {

        // Verify token 

        const decoded = await jwt.verify(token, jwtKey);
        req.email = decoded.email;

        // call the next 

        next();

    } catch (err) {
        res.status(401).json({
            message: 'token is not valid'
        })
    }
}

module.exports = authMiddleware;