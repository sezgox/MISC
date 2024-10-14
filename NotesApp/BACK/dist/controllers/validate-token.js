"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = exports.decodeToken = exports.validateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validateToken = (req, res, next) => {
    const headerToken = req.headers['authorization'];
    if (headerToken == undefined) {
        return res.status(401).json({ msg: "Access denied" });
    }
    if (headerToken.startsWith('Bearer ')) {
        try {
            const token = headerToken.slice(7);
            jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY_TOKEN || 'KEY_PARA_TOKEN');
            next();
        }
        catch (error) {
            console.log('Invalid token');
            res.status(401).json({ msg: "Invalid token" });
        }
    }
};
exports.validateToken = validateToken;
const decodeToken = (req) => {
    const headerToken = req.headers['authorization'];
    const token = headerToken.slice(7);
    const decodedToken = jsonwebtoken_1.default.decode(token);
    return decodedToken;
};
exports.decodeToken = decodeToken;
const isAuth = (req, res) => {
    const headerToken = req.headers['authorization'];
    if (headerToken != undefined) {
        try {
            const token = headerToken.slice(7);
            jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY_TOKEN || 'KEY_PARA_TOKEN');
            res.status(201).json(true);
        }
        catch (error) {
            console.log('Invalid token');
            res.json(false);
        }
    }
    else {
        res.json(false);
    }
};
exports.isAuth = isAuth;
