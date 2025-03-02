import { Schema, model } from "mongoose";
import { encrypt } from '../../utils/encrypt.js'

const modelSchema = new Schema({
        name: {
            type: String,
            required: [true, 'Name is required'],
            maxLength: [30, 'Cannot exceed 30 characters']
        },
        surname: {
            type: String,
            required: [true, 'Surname is required'],
            maxLength: [30, 'Cannot exceed 30 characters']
        },
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            maxLength: [15, 'Cannot exceed 15 characters']
        },
        email: {
            type: String,
            unique: true,
            required: [true, 'Email is required'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        phone: {
            type: String,
            required: [true, 'Phone is required'],
            minLength: [8, 'Cannot be less than 8 characters'],
            maxLength: [8, 'Cannot exceed 8 characters']
        },
        role: {
            type: String,
            enum: ["ADMIN", "CLIENT"],
            default: 'CLIENT'
        },
        carrito: [{
            type: Schema.Types.ObjectId,
            ref: 'Carrito'
        }],
        status: {
            type: Boolean,
            default: true
        }
    }
)

const User = model("User", modelSchema)

const createAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: "ADMIN" })
        if (!adminExists) {
            const hashedPassword = await encrypt("W2Axa2-28")
            const admin = new User({
                name: "Ricardo",
                surname: "Galindo",
                username: "rgalindo",
                email: "rgalindo@gmail.com",
                password: hashedPassword,
                phone: "52356841",
                role: "ADMIN",
                status: "true",
            })
            await admin.save()
            console.log("Default admin created")
        }
    } catch (error) {
        console.error("Error creating default admin:", error)
    }
}
createAdmin()

export default User