"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const profile_1 = require("../controllers/profile");
const validate_token_1 = require("../controllers/validate-token");
const router = (0, express_1.default)();
router.get('/:username', validate_token_1.validateToken, profile_1.getInfoProfile);
exports.default = router;
