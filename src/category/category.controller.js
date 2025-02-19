import Category from './category.model.js'
import Product from '../product/product.model.js'

export const addCategory = async (req, res) => {
        try {
            if (!req.body.name, !req.body.description) {
                return res.status(400).send({
                    success: false,
                    message: 'Category data is required'
                })
            }
            const existingCategory = await Category.findOne(
                { 
                    name: req.body.name,
                     description: req.body.description 
                    }
                )
            if (existingCategory) {
                return res.status(400).send({
                    success: false,
                    message: 'Category with this name already exists'
                }
            )
            }
            const newCategory = new Category(req.body)
            await newCategory.save()
            res.status(201).send({
                success: true,
                message: 'Category added successfully',
                category: newCategory
            }
        )
        } catch (error) {
            console.error('Error adding category:', error)
            res.status(500).send({
                success: false,
                message: 'General error'
            }
        )
    }
}

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params
        const category = await Category.findById(id)
        if (!category) {
            return res.status(404).send({
                success: false,
                message: 'Category not found'
            }
        )
        }
        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({
                success: false,
                message: 'No data provided for update'
            }
        )
        }
        Object.keys(req.body).forEach(key => {
            if (['name', 'description'].includes(key)) {
                category[key] = req.body[key]
            }
        }
    )
        await category.save();
        res.send({
            success: true,
            message: 'Category updated successfully',
            category
        }
    )
    } catch (error) {
        console.error('Error updating category:', error)
        res.status(500).send(
            { 
                success: false,
                message: 'General error' 
            }
        )
    }
}

export const getCategory = async (req, res) => {
    try {
        const categories = await Category.find()
        res.send({
            success: true,
            message: 'Categories retrieved successfully',
            categories
        }
    )
    } catch (error) {
        console.error('Error retrieving categories:', error)
        res.status(500).send(
            { 
                success: false,
                message: 'General error' 
            }
        )
    }
}

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params
        const category = await Category.findById(id)
        if (!category) {
            return res.status(404).send({
                success: false,
                message: 'Category not found'
            })
        }
        const generalCategory = await Category.findOne({ name: 'General' })
        if (!generalCategory) {
            return res.status(500).send({
                success: false,
                message: 'General category is missing, please create it first'
            })
        }
        await Product.updateMany({ categoryId: id }, { categoryId: generalCategory._id })
        await Category.findByIdAndDelete(id)

        res.send({
            success: true,
            message: 'Category deleted successfully, products reassigned to General'
        })

    } catch (error) {
        console.error('Error deleting category:', error)
        res.status(500).send({
            success: false,
            message: 'General error',
            error: error.message
        })
    }
}
