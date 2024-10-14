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
const user_1 = require("../models/user");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = yield user_1.User.findOne({ where: { username: req.body.username } });
    if (user) {
        return res.status(400).json({
            msg: "Username already in use"
        });
    }
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        try {
            yield user_1.User.create({
                username: username,
                password: hashedPassword
            });
            res.status(200).json({
                msg: "User created :)"
            });
        }
        catch (error) {
            res.status(400).json(error);
        }
    }
    catch (error) {
        res.status(400).json(error);
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        console.log(username, password);
        const user = yield user_1.User.findOne({ where: { username: req.body.username } });
        if (!user) {
            return res.status(400).json({
                msg: "User doesn't exists"
            });
        }
        const passwordIsValid = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ msg: "Password incorrect" });
        }
        const token = jsonwebtoken_1.default.sign({
            username: username,
            id: user.id
        }, process.env.SECRET_KEY_TOKEN || 'KEY_PARA_TOKEN');
        res.json(token);
    }
    catch (error) {
        res.json(error);
    }
});
exports.login = login;
