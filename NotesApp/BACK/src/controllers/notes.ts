import { Request, Response } from "express";
import { Op } from 'sequelize';
import { decodeToken } from '../controllers/validate-token';
import { Note } from "../models/note";


export const getNotes = async (req: Request, res: Response) => {
    const decodedToken = decodeToken(req);
    const user = decodedToken.username;
    const filter = req.query;
    //FECHA, USUARIO, TIPO
    const date = filter.date ? filter.date : '01/01/2024';
    const username = filter.username ?? null;
    const showAllstr = filter.showAll ?? null;
    const where:any = {};

    if(username){
        where.user = username;
    }
    if(user==username){
    //SI EL USUARIO QUE ENVIA LA PETICION ES EL MISMO QUE EL DE EL FILTRO...
        if(showAllstr != null){
            //...PODRÁ MOSTRAR SUS NOTAS PÚBLICAS O PRIVADAS SEGÚN PIDA...
            where.showAll = showAllstr == "true";
        }else{
            //... O PODRÁ MOSTRAR TODAS
            where.showAll = {
                [Op.or]:[true,false]
            }
        }
    //SI EL USUARIO QUE ENVIA LA PETICION ES DISTINTO AL DEL FILTRO...
    }else{
        //SOLO PODRÁ VER LAS NOTAS PÚBLICAS DEL USUARIO DEL FILTRO
        where.showAll = true;
    }
    where.updatedAt = {
        [Op.gt]: date
    }

    try {
        const listNotes = await Note.findAll({where: where});
        res.status(200).json(listNotes);
    } catch (error) {
        res.status(400).json(error)
    }
}

export const newNote = async (req: Request, res: Response) => {
    const {title,description,showAll} = req.body
    const decodedToken = decodeToken(req);
    const user = decodedToken.username;

    try {
        await Note.create({
            title: title,
            description: description,
            showAll: showAll,
            user: user
        });
        console.log(title,description,showAll,user)
        res.status(200).json({
            msg: "Nota creada"
        });
    } catch (error) {
        res.status(400).json(error);
    }

    
}

export const getNoteToEdit = async (req: Request, res: Response) => {
    const id = req.params.id;
    const decodedToken = decodeToken(req);
    const user = decodedToken.username;
    const note = await Note.findOne({where:  {id: id, user: user}});
    if(note){
        return res.status(200).json(note);
    }
    res.status(400).json({msg:"Usuario no tiene esa nota bribon"})
}

export const editNote = async (req: Request, res: Response) => {
    const id = req.params.id;
    const {title,description,showAll} = req.body;
    const decodedToken = decodeToken(req);
    const user = decodedToken.username;
    const currentNote = await Note.findOne({where: {id: id, user: user}});
    if (!currentNote){
        return res.status(401).json({msg: "Usuario no es dueño de esa nota"})
    }
    try {
        await Note.update({
            title: title,
            description: description,
            showAll: showAll
        },
        {where: {id: id}});
        res.status(200).json({msg:"Note edited"});
    } catch (error) {
        res.status(400).json(error);
    }
}

export const removeNote = async (req: Request, res: Response) => {
    const id = req.params.id;
    const decodedToken = decodeToken(req);
    const user = decodedToken.username;
    const note = await Note.findOne({where:  {id: id, user: user}});
    if(note){
        try {
            await Note.destroy({where:  {id: id}})
            return res.status(200).json({msg: "Nota eliminada :):"});
        } catch (error) {
            return res.json(error);
        }
    }
    res.status(401).json({msg:"Usuario no tiene esa nota bribon"});
}