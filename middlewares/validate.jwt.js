'use strict'

import jwt from 'jsonwebtoken'
import { existUserById } from '../helpers/db.validators.js'

export const validateJwt = async (req, res, next) => {
    try {
        let secretKey = process.env.SECRET_KEY
        let { authorization } = req.headers
        if (!authorization) {
            return res.status(401).send({ message: 'Unauthorized' })
        }
        let user = jwt.verify(authorization, secretKey)
        const userExists = await existUserById(user.uid)
        if (!userExists) {
            return res.status(404).send({ message: 'User not found or removed' })
        }
        req.user = user
        next()
    } catch (err) {
        console.error('JWT Error:', err);
        return res.status(401).send({ message: 'Invalid token or expired' })
    }
}

export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).send({ message: 'Access denied, insufficient privileges' })
    }
    next()
}

export const isClient = (req, res, next) => {
    if (req.user.role !== 'CLIENT') {
        return res.status(403).send({ message: 'Access denied, only allowed for clients' })
    }
    next()
}