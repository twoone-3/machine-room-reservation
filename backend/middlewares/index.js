// filepath: c:\Users\Administrator\dev\machine-room-reservation\backend\src\middlewares\index.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send('A token is required for authentication');
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send('Invalid Token');
        }
        req.user = decoded;
        next();
    });
};

const checkAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Access denied, admin only');
    }
    next();
};

module.exports = {
    verifyToken,
    checkAdmin,
};