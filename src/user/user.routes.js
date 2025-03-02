import { Router } from 'express'
import { 
    getUserProfile, 
    getAll, 
    updateUserProfile,
    deleteAccount,
    updateUserRole,
    deleteUser,
    updateUserProfileByAdmin,
    updatePassword,
    addUser,
    getPurchaseHistorial
} from './user.controller.js'
import { validateJwt} from '../../middlewares/validate.jwt.js'
import { isAdmin, isClient } from '../../middlewares/validate.jwt.js'
import { updateUserValidator, updatePasswordValidator } from '../../helpers/validator.js'

const api = Router()

api.post(
    "/addAdmin",
    [validateJwt],
    [isAdmin],
    addUser
)

api.get(
    '/', 
    [validateJwt], 
    [isAdmin],
    getAll
)
api.get(
    '/myUser', 
    [validateJwt], 
    [isClient],
    getUserProfile
)

api.put(
    '/',
    [validateJwt],
    [isAdmin],
    updateUserRole
)

api.put(
    '/:id',
    [validateJwt],
    [isAdmin],
    [updateUserValidator],
    updateUserProfileByAdmin
)

api.put(
    '/password/account', 
    [validateJwt], 
    [isClient],
    [updatePasswordValidator],
    updatePassword
)

api.put(
    '/MyProfile/:id',
    [validateJwt], 
    [isClient],
    [updateUserValidator],
    updateUserProfile
)

api.delete(
    '/',
    [validateJwt],
    [isClient],
    deleteAccount
)

api.delete(
    '/:id',
    [validateJwt],
    [isAdmin],
    deleteUser
)

api.get(
    '/myHistorial',
    [validateJwt],
    [isClient],
    getPurchaseHistorial
)

export default api