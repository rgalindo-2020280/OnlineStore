import Product from './product.model.js'
import Category from '../category/category.model.js'

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

        // Verificar si el nombre ya existe en otro producto
        if (req.body.name) {
            const existingProduct = await Product.findOne({ name: req.body.name, _id: { $ne: id } })
            if (existingProduct) {
                return res.status(400).send({
                    success: false,
                    message: 'Product name is already taken'
                })
            }
        }

        // 🔹 Manejo de actualización de categoría
        if (req.body.categoryId && req.body.categoryId !== product.categoryId.toString()) {
            const oldCategory = await Category.findById(product.categoryId)
            const newCategory = await Category.findById(req.body.categoryId)

            if (!newCategory) {
                return res.status(400).send({
                    success: false,
                    message: 'New category does not exist'
                })
            }

            // 🔹 Eliminar el producto de la categoría anterior
            if (oldCategory) {
                oldCategory.products = oldCategory.products.filter(prodId => prodId.toString() !== id)
                await oldCategory.save()
            }

            // 🔹 Agregar el producto a la nueva categoría
            newCategory.products.push(product._id)
            await newCategory.save()
        }

        // 🔹 Actualizar solo los campos permitidos
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