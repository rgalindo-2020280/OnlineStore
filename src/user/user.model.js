import { Schema, model } from "mongoose";

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
        status: {
            type: Boolean,
            default: true
        }
    }
)

export default model('User', modelSchema)