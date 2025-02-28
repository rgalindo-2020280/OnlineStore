import { Router } from 'express'
import { createFacture } from './facture.controller.js'
import { validateJwt } from '../../middlewares/validate.jwt.js'
import { isClient } from '../../middlewares/validate.jwt.js'

const api = Router()

api.post(
    '/facture',
    [validateJwt],
    [isClient],
    createFacture
)

export default api
