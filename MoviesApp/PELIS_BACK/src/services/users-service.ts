import { UserExists, UserInfo } from "../interfaces/my-responses"
import { User } from "../models/Users"

export const userExists = async (username:string):Promise<UserExists> => {

    try {
        const user = await User.findOne({where: {username:username},attributes:['uid','username','createdAt']})
        if(user) {
            const data:UserInfo = user.dataValues
            return {success:true,data:data}
        }
        return {success:false,error:'User not found'}
    } catch (error) {
        console.log(error)
        return {success:false,error:'Unvalid data'}
    }
    
}