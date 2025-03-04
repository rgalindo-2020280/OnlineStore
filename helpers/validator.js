import { body } from "express-validator" 
import { validateErrorWithoutImg } from "./validate.error.js"
import { existUsername, existEmail, objectIdValid } from "./db.validators.js"
import Product from '../src/product/product.model.js'
import User from '../src/user/user.model.js'
import Carrito from '../src/carrito/carrito.model.js'

export const registerValidator = [
    body('name', 'Name cannot be empty')
        .notEmpty(),
    body('surname', 'Surname cannot be empty')
        .notEmpty(),
    body('email', 'Email cannot be empty or is not a valid email')
        .notEmpty()
        .isEmail()
        .custom(existEmail),
    body('username', 'Username cannot be empty')
        .notEmpty()
        .toLowerCase()
        .custom(existUsername),
    body('password', 'Password cannot be empty')
        .notEmpty()
        .isStrongPassword()
        .withMessage('The password must be strong')
        .isLength({min: 8}),
    body('phone', 'Phone cannot be empty or is not a valid phone')
        .notEmpty()
        .isMobilePhone(),
        validateErrorWithoutImg
]

export const loginValidator = [
    body('userLoggin', 'Username or email cannot be empty')
        .notEmpty()
        .toLowerCase(),
    body('password', 'Password cannot be empty')
        .notEmpty()
        .isStrongPassword()
        .withMessage('The password must be strong')
        .isLength({min: 8}),
        validateErrorWithoutImg
]

export const updateUserValidator = [
    body('name', 'Name must be a string')
    .optional()
    .notEmpty()
    .isString(),
    body('surname', 'Surname must be a string')
    .optional()
    .notEmpty()
    .isString(),
    body('username', 'Username must be a string')
    .notEmpty()
    .optional(),
    body('email', 'Invalid email format')
    .optional()
    .notEmpty()
    .custom(existEmail)
    .isEmail(),
    body('phone', 'Invalid phone number')
    .optional()
    .notEmpty()
    .isMobilePhone(),
    body('password', 'Password update is not allowed')
    .not()
    .exists(),
    body('role', 'Role cannont update')
    .not()
    .exists(),
    validateErrorWithoutImg 
]

export const addProductValidator = [
    body('name', 'Product name is required')
        .notEmpty()
        .isString()
        .isLength({ max: 100 }),
    body('description')
        .optional()
        .isString()
        .isLength({ max: 500 }),
    body('price', 'Product price is required')
        .notEmpty()
        .isFloat({ min: 0 }),
    body('stock', 'Stock quantity is required')
        .notEmpty()
        .isInt({ min: 0 }),
    body('categoryId', 'Category ID is required')
        .notEmpty()
        .isMongoId(),
    validateErrorWithoutImg 
]

export const updateProductValidator = [
    body('name')
        .optional()
        .notEmpty()
        .isString()
        .isLength({ max: 100 }),
    body('description')
        .optional()
        .notEmpty()
        .isString()
        .isLength({ max: 500 }),
    body('price')
        .optional()
        .notEmpty()
        .isFloat({ min: 0 }),
    body('stock')
        .optional()
        .notEmpty()
        .isInt({ min: 0 }),
    body('categoryId')
        .optional()
        .notEmpty()
        .isMongoId(),
    validateErrorWithoutImg 
]

export const addCategoryValidator = [
    body('name', 'Category name is required')
        .notEmpty()
        .isString()
        .isLength({ max: 50 }),
    body('description')
        .optional()
        .isString()
        .isLength({ max: 200 }),
    validateErrorWithoutImg
]

export const updateCategoryValidator = [
    body('name', 'name is required')
        .optional()
        .notEmpty()
        .isString()
        .isLength({ max: 50 }),
    body('description')
        .optional()
        .isString()
        .isLength({ max: 200 }),
    validateErrorWithoutImg 
]

export const updatePasswordValidator = [
    body('newPassword', 'New password cannot be empty')
        .notEmpty()
        .isStrongPassword()
        .withMessage('The password must be strong')
        .isLength({min: 8}),
    body('oldPassword', 'Old password cannot be empty')
        .notEmpty(),
    validateErrorWithoutImg 
]

export const addProductCarritoValidator = [
    body('productId', 'Product ID is required')
        .notEmpty()
        .isMongoId().withMessage('Invalid Product ID'),

    body('quantity', 'Quantity is required')
        .notEmpty()
        .isInt({ min: 1 })
        .custom(async (quantity, { req }) => {
            const product = await Product.findById(req.body.productId)
            if (!product) {
                throw new Error('Product not found')
            }
            if (product.stock < quantity) {
                throw new Error(`Not enough stock for product: ${product.name}. Available stock: ${product.stock}`)
            }
            return true
        }),
    validateErrorWithoutImg 
]

export const addFactureValidator = [
    body('userId')
        .notEmpty().withMessage('User ID is required')
        .isMongoId().withMessage('Invalid User ID')
        .custom(async (userId) => {
            const carrito = await Carrito.findOne({ userId })
            if (!carrito || carrito.products.length === 0) {
                throw new Error('Cart is empty, cannot create a facture')
            }
            for (const item of carrito.products) {
                const product = await Product.findById(item.productId)
                if (product && product.stock < item.quantity) {
                    throw new Error(`Not enough stock for product: ${product.name}. Available stock: ${product.stock}`)
                }
            }
            return true
        }),
    validateErrorWithoutImg
]

export const addUserValidator = [
    body('name').notEmpty().withMessage('Name is required'),
    body('surname').notEmpty().withMessage('Surname is required'),
    body('username').notEmpty().withMessage('Username is required')
        .custom(async (username) => {
            const existingUsername = await User.findOne({ username })
            if (existingUsername) {
                throw new Error('Username is already taken')
            }
            return true
        }),
    body('email').notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .custom(async (email) => {
            const existingEmail = await User.findOne({ email })
            if (existingEmail) {
                throw new Error('Email is already taken')
            }
            return true
        }),
    body('password').notEmpty().withMessage('Password is required')
        .isStrongPassword().withMessage('Password must be strong'),
    body('phone').notEmpty().withMessage('Phone is required')
        .isMobilePhone().withMessage('Invalid phone number format'),
    body('role').notEmpty().withMessage('Role is required')
        .isIn(['ADMIN', 'CLIENT']).withMessage('Invalid role'),
    validateErrorWithoutImg
]
