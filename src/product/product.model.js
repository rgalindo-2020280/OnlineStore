import { Schema, model } from "mongoose";

const productSchema = new Schema({
        name: {
            type: String,
            required: [true, 'Product name is required'],
            unique: true,
            maxLength: [100, 'Cannot exceed 100 characters']
        },
        description: {
            type: String,
            maxLength: [500, 'Cannot exceed 500 characters']
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            min: [0, 'Price cannot be negative']
        },
        stock: {
            type: Number,
            required: [true, 'Stock quantity is required'],
            min: [0, 'Stock cannot be negative']
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category ID is required']
        },
        status: {
            type: Boolean,
            default: true
        }
    }
)

export default model('Product', productSchema)
