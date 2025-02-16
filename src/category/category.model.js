import { Schema, model } from "mongoose";

const categorySchema = new Schema({
        name: {
            type: String,
            required: [true, 'Category name is required'],
            unique: true,
            maxLength: [50, 'Cannot exceed 50 characters']
        },
        description: {
            type: String,
            maxLength: [200, 'Cannot exceed 200 characters']
        }
    }
)

export default model('Category', categorySchema)
