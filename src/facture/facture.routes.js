import { Router } from 'express'
import { addFacture, getUserFactures, updateFacture } from './facture.controller.js'
import { validateJwt } from '../../middlewares/validate.jwt.js'
import { isClient, isAdmin } from '../../middlewares/validate.jwt.js'

const api = Router()

api.post(
    '/addFacture',
    [validateJwt],
    [isAdmin],
    addFacture
)

api.put(
    '/:id',
    [validateJwt],
    [isAdmin],
    updateFacture
)

api.get(
    '/getUserFacture',
    [validateJwt],
    [isAdmin],
    getUserFactures
)

export default api
