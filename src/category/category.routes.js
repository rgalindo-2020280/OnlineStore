import { Router } from 'express'
import { 
    addCategory,
    updateCategory,
    getCategory,
    deleteCategory
} from './category.controller.js'
import { validateJwt} from '../../middlewares/validate.jwt.js'
import { isAdmin} from '../../middlewares/validate.jwt.js'
import { addCategoryValidator, updateCategoryValidator } from '../../helpers/validator.js'

const api = Router()

api.post(
    '/addCategory',
    [validateJwt],
    [isAdmin],
    [addCategoryValidator],
    addCategory
)

api.put(
    '/:id',
    [validateJwt],
    [isAdmin],
    [updateCategoryValidator],
    updateCategory
)

api.get(
    '/',
    [validateJwt],
    getCategory
)

api.delete(
    '/:id',
    [validateJwt],
    [isAdmin],
    deleteCategory
)

export default api