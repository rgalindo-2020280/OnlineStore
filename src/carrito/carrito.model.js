import { Schema, model } from "mongoose"
//import Facture from './facture.model.js'

const carritoSchema = new Schema({
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
            },
            subtotal: {
                type: Number,
                required: true
            }
        }],
        totalAmount: {
            type: Number,
            required: true
        }
    }
)

carritoSchema.pre('save', function (next) {
    this.products.forEach(product => {
        product.subtotal = product.quantity * product.price
    })

    this.totalAmount = this.products.reduce((acc, product) => acc + product.subtotal, 0)
    next()
})

carritoSchema.methods.completePurchase = async function() {
    const facture = new Facture({
        userId: this.userId,
        products: this.products,
        totalAmount: this.totalAmount
    })
    await facture.save()
    this.products = []
    this.totalAmount = 0
    await this.save()  
    return facture
}

export default model('Carrito', carritoSchema)
