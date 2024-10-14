import bcrypt from 'bcrypt';
import { Request, Response } from "express";
import jswt from 'jsonwebtoken';
import { User } from "../models/Users";

export const register = async (req: Request, res: Response) => {
    const {username,password} = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password,10);
        const uid = crypto.randomUUID();
        User.findOrCreate({
            where: {username : username},
            defaults: {uid: uid,username: username,password:hashedPassword}
        }).then(([user,created]) => {
            if(created){
                const data = user.dataValues;
                res.status(200).json({success:true,data:{username: data.username, createdAt: data.createdAt}});
            }else{
                res.status(200).json({success:false,error:'Username in use'})
            }
        }).catch((err) => {
            console.log(err)
            res.json({success:false,error:'Unvalid data'})
        })
    } catch (error) {
        console.log(error)
        res.json({success:false,error:'Unvalid data'})
    }
}

export const login = (req: Request, res: Response) => {
    const {username,password} = req.body;
    User.findOne({
        where: {username: username}
    }).then(async (exists) => {
        if(exists){
            const user = exists.dataValues;
            const hashedPassword = user.password;
            try {
                const isValid = await bcrypt.compare(password,hashedPassword);
                if(isValid){
                    const token = createToken(user.username,user.uid);
                    res.status(200).json({success:true,data:token})
                }else{
                    res.json({success:false,error:`Username or password incorrect`})
                }
            } catch (error) {
                console.log(error)
                res.json({success:false,error:'Unvalid data'})
            }
        }else{
            res.status(200).json({success:false,error:`Username or password incorrect`})
        }
    }).catch((err) => {
        console.log(err)
        res.json({success: false, error:'Unvalid data'})
    })
}

const createToken = (username:string,uid:string) => {
    const token = jswt.sign({
        username: username,
        uid: uid
    },
    process.env.SECRET_KEY_TOKEN ?? 'KLK_MANIN',{
        expiresIn: "1h"
    });
    return token;
}

