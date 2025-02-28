import Facture from './facture.model.js'
import Product from '../product/product.model.js'
import Carrito from '../carrito/carrito.model.js'

export const createFacture = async (req, res) => {
    try {
        const userId = req.user.uid;
        const carrito = await Carrito.findOne({ userId })

        if (!carrito || carrito.products.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'Cart is empty, cannot create an facture'
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
        const newFacture = new Facture({
            userId,
            products: carrito.products.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount: carrito.totalAmount,
            status: 'PENDING'
        });
        for (const item of carrito.products) {
            const product = await Product.findById(item.productId)
            product.stock -= item.quantity
            await product.save()
        }

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
        console.error('Error creating facture:', error);
        res.status(500).send({
            success: false,
            message: 'Error creating facture'
        })
    }
}