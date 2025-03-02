import User from '../user/user.model.js'
import Carrito from '../carrito/carrito.model.js'
import { checkPassword, encrypt } from '../../utils/encrypt.js'
import { generateJwt} from '../../utils/jwt.js'
//test
export const test = (req, res)=>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

//Register
export const register = async (req, res) => {
    try {
        let data = req.body
        let user = new User(data)
        user.password = await encrypt(user.password)
        user.role = 'CLIENT'
        await user.save()
        const newCarrito = new Carrito({
            userId: user._id,  
            products: [],
            totalAmount: 0
        })
        await newCarrito.save()
        user.carrito = newCarrito._id
        await user.save()
        return res.send({
            message: `Registered successfully, can be logged with username: ${user.username}`,
            user,
            carritoId: newCarrito._id
        })
    } catch (err) {
        console.error(err);
        return res.status(500).send({
            message: 'General error with registering user',
            err
        })
    }
}



//Login
export const login = async (req, res) => {
    try {
        let { userLoggin, password } = req.body;
        let user = await User.findOne({
                $or: [
                    { email: userLoggin },
                    { username: userLoggin }
                ]
            }
        )
        if (!user) {
                return res.status(400).send({
                    success: false,
                    message: 'Wrong email or password'
                }
            )
        }
        if (!user.status) {
                return res.status(400).send({
                    success: false,
                    message: 'User account is not active. Please contact support.'
                }
            )
        }
        const isPasswordValid = await checkPassword(user.password, password);
            if (!isPasswordValid) {
                return res.status(400).send({
                    success: false,
                    message: 'Wrong email or password'
                }
            )
        }
        let loggedUser = {
            uid: user._id,
            name: user.name,
            username: user.username,
            role: user.role
        }
        let token = await generateJwt(loggedUser);
        return res.send({
                success: true,
                message: `Welcome ${user.name}`,
                loggedUser,
                token
            }
        )
    } catch (err) {
            console.error('Error in login function:', err)
            return res.status(500).send({
                success: false,
                message: 'General error with login function',
                error: err.message
            }
        )
    }
}
