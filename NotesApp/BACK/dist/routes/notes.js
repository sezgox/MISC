"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notes_1 = require("../controllers/notes");
const validate_token_1 = require("../controllers/validate-token");
const router = (0, express_1.Router)();
router.get('/', validate_token_1.validateToken, notes_1.getNotes);
router.post('/add', validate_token_1.validateToken, notes_1.newNote);
router.get('/edit/:id', validate_token_1.validateToken, notes_1.getNoteToEdit);
router.put('/edit/:id', validate_token_1.validateToken, notes_1.editNote);
router.delete('/:id', validate_token_1.validateToken, notes_1.removeNote);
exports.default = router;
