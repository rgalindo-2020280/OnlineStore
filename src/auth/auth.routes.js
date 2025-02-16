import { Router } from "express"
import {
    register,
    login
} from "./auth.controller.js"
import { loginValidator, registerValidator } from "../../helpers/validator.js"

const api = Router()

api.post(
    '/register',
    [registerValidator],
    register
)

api.post(
    '/login',
    [loginValidator],
    login
)

export default api