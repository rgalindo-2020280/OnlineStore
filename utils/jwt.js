'use strict'

import jwt from 'jsonwebtoken'
                            //Objecto con datos (usuario)
export const generateJwt = async(payload)=>{
    try{
        return jwt.sign(
            payload,
            process.env.SECRET_KEY,
            {
                expiresIn: '35h', //recomendable 1h o 2h,
                algorithm: 'HS256'
            }
        )
    }catch(err){
        console.error(err)
        return err
    }
}