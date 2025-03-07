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
        if (product.stock < quantity) {
            return res.status(400).send({
                success: false,
                message: `Not enough stock for product: ${product.name}. Available stock: ${product.stock}`
            })
        }
        const existingProduct = carrito.products.find(p => p.productId.toString() === productId)
        if (existingProduct) {
            existingProduct.quantity += quantity
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
        console.error('Error adding product to cart:', error)
        res.status(500).send({
            success: false,
            message: 'General error',
            error: error.message
        })
    }
}


export const getCarrito = async (req, res) => {
    try {
        const userId = req.user.uid
        const carrito = await Carrito.findOne({ userId }).populate('products.productId')
        if (!carrito) {
            return res.status(404).send({
                success: false,
                message: 'Carrito not found'
            })
        }
        res.send({
            success: true,
            message: 'Carrito retrieved successfully',
            carrito
        })
    } catch (error) {
        console.error('Error retrieving carrito:', error)
        res.status(500).send({
            success: false,
            message: 'General error retrieving carrito',
            error: error.message
        })
    }
}

export const removeProductCarrito = async (req, res) => {
    try {
        const { productId } = req.body
        const userId = req.user.uid
        if (!productId) {
            return res.status(400).send({
                success: false,
                message: 'Product ID is required'
            })
        }
        const carrito = await Carrito.findOne({ userId: userId })
        if (!carrito) {
            return res.status(404).send({
                success: false,
                message: 'Cart not found'
            })
        }
        const productIndex = carrito.products.findIndex(p => p.productId.toString() === productId)

        if (productIndex === -1) {
            return res.status(404).send({
                success: false,
                message: 'Product not found in cart'
            })
        }
        carrito.products.splice(productIndex, 1)
        carrito.totalAmount = carrito.products.reduce((acc, product) => acc + product.subtotal, 0)
        await carrito.save()
        res.send({
            success: true,
            message: 'Product removed from cart successfully',
            carrito
        })
    } catch (error) {
        console.error('Error removing product from cart:', error)
        res.status(500).send({
            success: false,
            message: 'Error removing product from cart',
            error: error.message
        })
    }
}