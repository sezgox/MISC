"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Users_1 = require("../models/Users");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const uid = crypto.randomUUID();
        Users_1.User.findOrCreate({
            where: { username: username },
            defaults: { uid: uid, username: username, password: hashedPassword }
        }).then(([user, created]) => {
            if (created) {
                const data = user.dataValues;
                res.status(200).json({ success: true, data: { username: data.username, createdAt: data.createdAt } });
            }
            else {
                res.status(200).json({ success: false, error: 'Username in use' });
            }
        }).catch((err) => {
            console.log(err);
            res.json({ success: false, error: 'Unvalid data' });
        });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, error: 'Unvalid data' });
    }
});
exports.register = register;
const login = (req, res) => {
    const { username, password } = req.body;
    Users_1.User.findOne({
        where: { username: username }
    }).then((exists) => __awaiter(void 0, void 0, void 0, function* () {
        if (exists) {
            const user = exists.dataValues;
            const hashedPassword = user.password;
            try {
                const isValid = yield bcrypt_1.default.compare(password, hashedPassword);
                if (isValid) {
                    const token = createToken(user.username, user.uid);
                    res.status(200).json({ success: true, data: token });
                }
                else {
                    res.json({ success: false, error: `Username or password incorrect` });
                }
            }
            catch (error) {
                console.log(error);
                res.json({ success: false, error: 'Unvalid data' });
            }
        }
        else {
            res.status(200).json({ success: false, error: `Username or password incorrect` });
        }
    })).catch((err) => {
        console.log(err);
        res.json({ success: false, error: 'Unvalid data' });
    });
};
exports.login = login;
const createToken = (username, uid) => {
    var _a;
    const token = jsonwebtoken_1.default.sign({
        username: username,
        uid: uid
    }, (_a = process.env.SECRET_KEY_TOKEN) !== null && _a !== void 0 ? _a : 'KLK_MANIN', {
        expiresIn: "1h"
    });
    return token;
};
