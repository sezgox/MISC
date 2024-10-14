import { NextFunction, Request, Response } from 'express';
import jswt from 'jsonwebtoken';

export const validateToken = (req: Request, res: Response, next: NextFunction) => {
    const headerToken = req.headers['authorization'];

    if(headerToken == undefined){
       return res.status(401).json({msg:"Access denied"})
    }
    if(headerToken.startsWith('Bearer ')){
        try {
            const token = headerToken.slice(7);
            jswt.verify(token,process.env.SECRET_KEY_TOKEN || 'KEY_PARA_TOKEN');
            next();
        } catch (error) {
            console.log('Invalid token');
            res.status(401).json({msg:"Invalid token"});
        }
    }
}

export const decodeToken = (req: Request) => {
    const headerToken = req.headers['authorization'];
    const token = headerToken!.slice(7);
    const decodedToken: any = jswt.decode(token);
    return decodedToken;
}

export const isAuth = (req: Request, res: Response) => {
    const headerToken = req.headers['authorization'];
    if(headerToken != undefined){
        try {
            const token = headerToken.slice(7);
            jswt.verify(token,process.env.SECRET_KEY_TOKEN || 'KEY_PARA_TOKEN');
            res.status(201).json(true)
        } catch (error) {
            console.log('Invalid token');
            res.json(false);
        }
    }else{
        res.json(false)
    }

}
