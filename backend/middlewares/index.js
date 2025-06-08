import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 校验 JWT Token 中间件
 */
export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send('需要提供令牌进行身份验证');
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send('无效的令牌');
        }
        req.user = decoded;
        next();
    });
};

/**
 * 检查是否为管理员
 */
export const checkAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('拒绝访问，仅限管理员操作');
    }
    next();
};