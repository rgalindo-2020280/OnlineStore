import { Router } from 'express'
import { 
    addProductCarrito,
    getCarrito,
    removeProductCarrito
} from './carrito.controller.js'

import { validateJwt } from '../../middlewares/validate.jwt.js'
import { isClient } from '../../middlewares/validate.jwt.js'

const api = Router()

api.post(
    '/addCarrito',
    [validateJwt], 
    [isClient],   
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
