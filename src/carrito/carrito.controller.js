import Carrito from './carrito.model.js'
import Product from '../product/product.model.js'

export const addProductCarrito = async (req, res) => {
    try {
        const userId = req.user.uid
        const { productId, quantity } = req.body
        if (!productId || !quantity) {
            return res.status(400).send({
                success: false,
                message: 'Product ID and quantity are required'
            })
        }
        let carrito = await Carrito.findOne({ userId: userId })
        if (!carrito) {
            carrito = new Carrito({
                userId: userId,
                products: [],
                totalAmount: 0
            })
        }
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).send({
                success: false,
                message: 'Product not found'
            })
        }
        const existingProduct = carrito.products.find(p => p.productId.toString() === productId)

        if (existingProduct) {
            existingProduct.quantity = quantity  
            existingProduct.subtotal = existingProduct.quantity * product.price
        } else {
            carrito.products.push({
                productId: productId,
                quantity: quantity,
                price: product.price,
                subtotal: product.price * quantity 
            })
        }
        carrito.totalAmount = carrito.products.reduce((acc, product) => acc + product.subtotal, 0)
        await carrito.save()
        res.send({
            success: true,
            message: 'Product added to cart successfully',
            carrito
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'General error',
            error: error.message
        })
    }
}

