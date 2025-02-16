import { Router } from 'express'
import { 
    addProduct,
    deleteProduct,
    getInventoryReport,
    getOutOfStockProducts,
    updateProduct
} from './product.controller.js'
import { validateJwt} from '../../middlewares/validate.jwt.js'
import { isAdmin } from '../../middlewares/validate.jwt.js'
import { addProductValidator, updateProductValidator } from '../../helpers/validator.js'

const api = Router()

api.post(
    '/addProduct',
    [validateJwt],
    [isAdmin],
    [addProductValidator],
    addProduct
)

api.put(
    '/:id',
    [validateJwt],
    [isAdmin],
    [updateProductValidator],
    updateProduct
)

api.get(
    '/',
    [validateJwt],
    [isAdmin],
    getInventoryReport
)

api.get(
    '/OutProduct',
    [validateJwt],
    [isAdmin],
    getOutOfStockProducts
)

api.delete(
    '/:id',
    [validateJwt],
    [isAdmin],
    deleteProduct
)

export default api