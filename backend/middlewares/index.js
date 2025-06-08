// filepath: c:\Users\Administrator\dev\machine-room-reservation\backend\src\middlewares\index.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (req, res, next) => {
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

export const checkAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Access denied, admin only');
    }
    next();
};