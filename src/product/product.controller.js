import Product from './product.model.js'
import Category from '../category/category.model.js'
import Facture from '../facture/facture.model.js'

export const addProduct = async (req, res) => {
    try {
        if (!req.body.name || !req.body.price || !req.body.stock || !req.body.categoryId) {
            return res.status(400).send({
                    success: false,
                    message: 'Missing required fields: name, price, stock, categoryId'
                }
            )
        }
        const existingProduct = await Product.findOne({ name: req.body.name })
        if (existingProduct) {
            return res.status(400).send({
                    success: false,
                    message: 'Product with this name already exists'
                }
            )
        }
        const category = await Category.findById(req.body.categoryId)
        if (!category) {
            return res.status(400).send({
                    success: false,
                    message: 'Category does not exist'
                }
            )
        }
        const newProduct = new Product(req.body)
        await newProduct.save()
        category.products.push(newProduct._id)
        await category.save()
        res.status(201).send({
                success: true,
                message: 'Product added successfully',
                product: newProduct
            }
        )
    } catch (error) {
        console.error('Error adding product:', error)
        res.status(500).send({
                success: false,
                message: 'General error',
                error: error.message
            }
        )
    }
}


export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params
        const product = await Product.findById(id)

        if (!product) {
            return res.status(404).send({
                success: false,
                message: 'Product not found'
            })
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({
                success: false,
                message: 'No data provided for update'
            })
        }
        if (req.body.name) {
            const existingProduct = await Product.findOne({ name: req.body.name, _id: { $ne: id } })
            if (existingProduct) {
                return res.status(400).send({
                    success: false,
                    message: 'Product name is already taken'
                })
            }
        }
        if (req.body.categoryId && req.body.categoryId !== product.categoryId.toString()) {
            const oldCategory = await Category.findById(product.categoryId)
            const newCategory = await Category.findById(req.body.categoryId)

            if (!newCategory) {
                return res.status(400).send({
                    success: false,
                    message: 'New category does not exist'
                })
            }
            if (oldCategory) {
                oldCategory.products = oldCategory.products.filter(prodId => prodId.toString() !== id)
                await oldCategory.save()
            }
            newCategory.products.push(product._id)
            await newCategory.save()
        }
        const fieldsToUpdate = ['name', 'description', 'price', 'stock', 'categoryId']
        fieldsToUpdate.forEach(key => {
            if (req.body[key] !== undefined) {
                product[key] = req.body[key]
            }
        })
        await product.save()
        res.send({
            success: true,
            message: 'Product updated successfully',
            product
        })
    } catch (error) {
        console.error('Error updating product:', error)
        res.status(500).send({
            success: false,
            message: 'General error',
            error: error.message
        })
    }
}

export const getInventoryReport = async (req, res) => {
    try {
        const products = await Product.find().select('name stock price')
        const inventoryReport = products.map(product => ({
            name: product.name,
            stock: product.stock,
            price: product.price,
            status: product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Low Stock' : 'Available'
        }))

        res.send({
                success: true,
                message: 'Inventory report generated successfully',
                inventory: inventoryReport
            }
        )
    } catch (error) {
        console.error('Error generating inventory report:', error)
        res.status(500).send({ success: false, message: 'General error' })
    }
}

export const getOutOfStockProducts = async (req, res) => {
    try {
        const outOfStockProducts = await Product.find({ stock: 0 }).select('name price')
        if (outOfStockProducts.length === 0) {
            return res.send(
                { 
                    success: true, 
                    message: 'No out-of-stock products', products: [] 

                }
            )
        }
        res.send({
                success: true,
                message: 'Out-of-stock products retrieved successfully',
                products: outOfStockProducts
            }
        )
    } catch (error) {
        console.error('Error retrieving out-of-stock products:', error)
        res.status(500).send(
            { 
                success: false, 
                message: 'General error' 
            }
        )
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const user = await Product.findById(req.params.id)
        if (!user) {
            return res.status(404).send({ 
                success: false, 
                message: 'Product not found' 
            })
        }
        user.status = false
        await user.save()
            res.send({ 
                success: true, 
                message: 'Product deactivated successfully' 
            }
        )
    } catch (error) {
        console.error('Error deactivating user:', error)
            res.status(500).send({ 
                success: false, 
                message: 'General Error' 
            }
        )
    }
}

export const getTopProducts = async (req, res) => {
    try {
        const factures = await Facture.find()
            .select('products')
            .populate('products.productId', 'name price')
            .exec()
        const productCount = {}
        factures.forEach(facture => {
            facture.products.forEach(item => {
                const productId = item.productId._id.toString();
                if (!productCount[productId]) {
                    productCount[productId] = {
                        productId: productId,
                        name: item.productId.name,
                        price: item.productId.price,
                        totalSold: 0
                    }
                }
                productCount[productId].totalSold += item.quantity;
            })
        })
        const topSelling = Object.values(productCount)
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, 10)

        if (topSelling.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No top selling products found'
            })
        }

        res.send({
            success: true,
            message: 'Top selling products retrieved successfully',
            products: topSelling
        })
    } catch (error) {
        console.error('Error retrieving top selling products:', error)
        res.status(500).send({
            success: false,
            message: 'Error retrieving top selling products'
        })
    }
}

export const getProductByName = async (req, res) => {
    try {
        const { name } = req.body
        const product = await Product.findOne({ name: new RegExp('^' + name + '$', 'i') })

        if (!product) {
            return res.status(404).send({
                success: false,
                message: `Product with name "${name}" not found`
            })
        }

        res.send({
            success: true,
            product
        })
    } catch (error) {
        console.error('Error fetching product by name:', error)
        res.status(500).send({
            success: false,
            message: 'Error fetching product by name'
        })
    }
}
