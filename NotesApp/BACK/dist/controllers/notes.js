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
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeNote = exports.editNote = exports.getNoteToEdit = exports.newNote = exports.getNotes = void 0;
const sequelize_1 = require("sequelize");
const validate_token_1 = require("../controllers/validate-token");
const note_1 = require("../models/note");
const getNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const decodedToken = (0, validate_token_1.decodeToken)(req);
    const user = decodedToken.username;
    const filter = req.query;
    //FECHA, USUARIO, TIPO
    const date = filter.date ? filter.date : '01/01/2024';
    const username = (_a = filter.username) !== null && _a !== void 0 ? _a : null;
    const showAllstr = (_b = filter.showAll) !== null && _b !== void 0 ? _b : null;
    const where = {};
    if (username) {
        where.user = username;
    }
    if (user == username) {
        //SI EL USUARIO QUE ENVIA LA PETICION ES EL MISMO QUE EL DE EL FILTRO...
        if (showAllstr != null) {
            //...PODRÁ MOSTRAR SUS NOTAS PÚBLICAS O PRIVADAS SEGÚN PIDA...
            where.showAll = showAllstr == "true";
        }
        else {
            //... O PODRÁ MOSTRAR TODAS
            where.showAll = {
                [sequelize_1.Op.or]: [true, false]
            };
        }
        //SI EL USUARIO QUE ENVIA LA PETICION ES DISTINTO AL DEL FILTRO...
    }
    else {
        //SOLO PODRÁ VER LAS NOTAS PÚBLICAS DEL USUARIO DEL FILTRO
        where.showAll = true;
    }
    where.updatedAt = {
        [sequelize_1.Op.gt]: date
    };
    try {
        const listNotes = yield note_1.Note.findAll({ where: where });
        res.status(200).json(listNotes);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
exports.getNotes = getNotes;
const newNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, showAll } = req.body;
    const decodedToken = (0, validate_token_1.decodeToken)(req);
    const user = decodedToken.username;
    try {
        yield note_1.Note.create({
            title: title,
            description: description,
            showAll: showAll,
            user: user
        });
        console.log(title, description, showAll, user);
        res.status(200).json({
            msg: "Nota creada"
        });
    }
    catch (error) {
        res.status(400).json(error);
    }
});
exports.newNote = newNote;
const getNoteToEdit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const decodedToken = (0, validate_token_1.decodeToken)(req);
    const user = decodedToken.username;
    const note = yield note_1.Note.findOne({ where: { id: id, user: user } });
    if (note) {
        return res.status(200).json(note);
    }
    res.status(400).json({ msg: "Usuario no tiene esa nota bribon" });
});
exports.getNoteToEdit = getNoteToEdit;
const editNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { title, description, showAll } = req.body;
    const decodedToken = (0, validate_token_1.decodeToken)(req);
    const user = decodedToken.username;
    const currentNote = yield note_1.Note.findOne({ where: { id: id, user: user } });
    if (!currentNote) {
        return res.status(401).json({ msg: "Usuario no es dueño de esa nota" });
    }
    try {
        yield note_1.Note.update({
            title: title,
            description: description,
            showAll: showAll
        }, { where: { id: id } });
        res.status(200).json({ msg: "Note edited" });
    }
    catch (error) {
        res.status(400).json(error);
    }
});
exports.editNote = editNote;
const removeNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const decodedToken = (0, validate_token_1.decodeToken)(req);
    const user = decodedToken.username;
    const note = yield note_1.Note.findOne({ where: { id: id, user: user } });
    if (note) {
        try {
            yield note_1.Note.destroy({ where: { id: id } });
            return res.status(200).json({ msg: "Nota eliminada :):" });
        }
        catch (error) {
            return res.json(error);
        }
    }
    res.status(401).json({ msg: "Usuario no tiene esa nota bribon" });
});
exports.removeNote = removeNote;
