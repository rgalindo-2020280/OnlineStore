import { Schema, model } from "mongoose";

const factureSchema = new Schema({
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required']
        },
        products: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: [true, 'Product ID is required']
            },
            quantity: {
                type: Number,
                required: [true, 'Product quantity is required'],
                min: [1, 'Quantity must be at least 1']
            },
            price: {
                type: Number,
                required: [true, 'Product price is required']
            }
        }],
        totalAmount: {
            type: Number,
            required: [true, 'Total amount is required']
        },
        status: {
            type: String,
            enum: ['PENDING', 'PAID', 'CANCELLED'],
            default: 'PENDING'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
)

export default model('Facture', factureSchema)
