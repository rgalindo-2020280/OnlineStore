import Facture from './facture.model.js'
import Product from '../product/product.model.js'
import Carrito from '../carrito/carrito.model.js'

export const addFacture = async (req, res) => {
    try {
        const userId = req.user.uid
        const carrito = await Carrito.findOne({ userId })
        if (!carrito || carrito.products.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'Cart is empty, cannot create a facture'
            })
        }
        let isStockAvailable = true
        for (const item of carrito.products) {
            const product = await Product.findById(item.productId)
            if (product.stock < item.quantity) {
                isStockAvailable = false
                return res.status(400).send({
                    success: false,
                    message: `Not enough stock for product: ${product.name}. Available stock: ${product.stock}`
                })
            }
        }
        let totalAmount = carrito.products.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        let iva = totalAmount * 0.12
        totalAmount += iva
        const newFacture = new Facture({
            userId,
            products: carrito.products.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount,
            iva,
            status: 'PENDING'
        })
        await newFacture.save()
        carrito.products = []
        carrito.totalAmount = 0
        await carrito.save()
        res.send({
            success: true,
            message: 'Facture created successfully',
            facture: newFacture
        })
    } catch (error) {
        console.error('Error creating facture:', error)
        res.status(500).send({
            success: false,
            message: 'Error creating facture'
        })
    }
}


export const updateFacture = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        if (status !== 'PAID') {
            return res.status(400).send({
                success: false,
                message: 'Only status "PAID" can update the stock'
            })
        }
        const facture = await Facture.findById(id)
        if (!facture) {
            return res.status(404).send({
                success: false,
                message: 'Facture not found'
            })
        }
        if (facture.status === 'PAID') {
            return res.status(400).send({
                success: false,
                message: 'Facture is already marked as PAID'
            })
        }
        facture.status = status
        for (const item of facture.products) {
            const product = await Product.findById(item.productId)
            if (product.stock < item.quantity) {
                return res.status(400).send({
                    success: false,
                    message: `Not enough stock for product: ${product.name}. Available stock: ${product.stock}`
                })
            }
            product.stock -= item.quantity
            await product.save()
        }
        await facture.save()
        res.send({
            success: true,
            message: 'Facture updated successfully',
            facture
        })
    } catch (error) {
        console.error('Error updating facture status:', error)
        res.status(500).send({
            success: false,
            message: 'Error updating facture'
        })
    }
}

export const getUserFactures = async (req, res) => {
    try {
        const { userId } = req.body
        const factures = await Facture.find({ userId })
            .select('products totalAmount status createdAt')
            .populate('products.productId', 'name price')
            .sort({ createdAt: -1 })
        if (!factures || factures.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No factures found for this user'
            })
        }
        res.send({
            success: true,
            message: 'User factures retrieved successfully',
            factures
        })
    } catch (error) {
        console.error('Error retrieving user factures:', error);
        res.status(500).send({
            success: false,
            message: 'Error retrieving user factures'
        })
    }
}