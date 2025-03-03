import { Router } from 'express'
import { 
    addProductCarrito,
    getCarrito,
    removeProductCarrito
} from './carrito.controller.js'

import { validateJwt } from '../../middlewares/validate.jwt.js'
import { isClient } from '../../middlewares/validate.jwt.js'
import { addProductCarritoValidator } from '../../helpers/validator.js'

const api = Router()

api.post(
    '/addCarrito',
    [validateJwt], 
    [isClient],   
    [addProductCarritoValidator],
    addProductCarrito
)

api.get(
    '/getCarrito',
    [validateJwt],
    [isClient],
    getCarrito
)

api.delete(
    '/deleteProduct',
    [validateJwt],
    [isClient],
    removeProductCarrito
)

export default api
