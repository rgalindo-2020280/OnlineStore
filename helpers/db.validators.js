import User from '../src/user/user.model.js'
import { isValidObjectId } from 'mongoose'

export const existUsername = async(username)=>{
    const alreadyUsername = await User.findOne({username})
    if(alreadyUsername){
        console.error(`Username ${username} is already taken`)
        throw new Error(`Username ${username} is already taken`)
    }
}

export const existEmail = async(email)=>{
    const alreadyEmail = await User.findOne({email}) 
        if(alreadyEmail){
        console.error(`Email ${email} is already taken`)
        throw new Error(`Email ${email} is already taken`)
    }
}

export const objectIdValid = async(objectId)=>{    
    if(!isValidObjectId(objectId)){
        throw new Error(`Keeper is not objectId valid`)
    }
}

export const existUserById = async (uid) => {
    const user = await User.findById(uid)
    if (!user) {
        return false
    }
    return true
}