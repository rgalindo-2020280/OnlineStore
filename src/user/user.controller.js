import User from './user.model.js'
import argon2 from 'argon2'
import mongoose from 'mongoose'
import Facture from '../facture/facture.model.js'
import { checkPassword, encrypt } from '../../utils/encrypt.js'
// Opciones del CLiente
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.uid).select('-password')
        if (!user) {
            return res.status(404).send(
                {
                    message: 'User not found' 
                }
            )
        }
        return res.send(user)
    } catch (error) {
        console.error('Error retrieving user profile:', error)
        return res.status(500).send(
            {
                success: false,
                message: 'General Error' 
            }
        )
    }
}

export const updateUserProfile = async (req, res) => {
    try {
        const { name, surname, username, email, phone } = req.body
        if (!name && !surname && !username && !email && !phone) {
            return res.status(400).send(
                {
                    success: false,
                    message: 'Information needed' 
                }
            )
        }
        const user = await User.findById(req.user.uid)
        if (!user) return res.status(404).send(
            {
                success: false,
                message: 'User not found' 
            }
        )
        if (name) user.name = name
        if (surname) user.surname = surname
        if (username) user.username = username
        if (email) user.email = email
        if (phone) user.phone = phone
        await user.save();
        res.send(
            {
                success: true,
                message: 'Profile updated successfully', user 
            }
        )
    } catch (error) {
        console.error('Error updating user profile:', error)
        res.status(500).send(
            {
                success: false,
                message: 'General Error' 
            }
        )
    }
}


export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body
        if (!password) {
            return res.status(400).send(
                {
                    success: false, 
                    message: 'Password is required to delete the account' 
                }
            )
        }
        const user = await User.findById(req.user.uid)
        if (!user) {
            return res.status(404).send(
                {
                    success: false,
                    message: 'User not found' 
                }
            )
        }
        const isPasswordValid = await argon2.verify(user.password, password)
        if (!isPasswordValid) {
            return res.status(403).send(
                {
                    success: false,
                    message: 'Incorrect password' 
                }
            )
        }
        user.status = false
        await user.save()
        res.send(
            {
                success: true, 
                message: 'Account deactivated successfully' 
            }
        )
    } catch (error) {
        console.error('Error deactivating user account:', error)
        res.status(500).send(
            { 
                success: false,
                message: 'General Error' 
            }
        )
    }
}

export const updatePassword = async (req, res) => {
    try {
        const userId = req.user.uid
        const { oldPassword, newPassword } = req.body
        const user = await User.findById(userId)
        if (!user) {
                return res.status(404).send({
                    success: false,
                    message: "User not found"
                }
            )
        }
        const isPasswordCorrect = await checkPassword(user.password, oldPassword)
        if (!isPasswordCorrect) {
            return res.status(400).send(
                { 
                    message: 'Wrong old password' 
                }
            )
        }
        user.password = await encrypt(newPassword)
        await user.save()
        return res.send(
            {
                success: true,
                message: "Password updated successfully"
            }
        )
    } catch (err) {
            return res.status(500).send(
            {
                success: false,
                message: "General error",
                error: err.message || err
            }
        )
    }
}

export const getPurchaseHistorial = async (req, res) => {
    try {
        const userId = req.user.uid
        const factures = await Facture.find({ userId })
            .select('products totalAmount status createdAt')
            .populate('products.productId', 'name price')
            .sort({ createdAt: -1 })

        if (!factures || factures.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No purchase history found for this user'
            })
        }

        res.send({
                success: true,
                message: 'Purchase history retrieved successfully',
                factures
            }
        )
    } catch (error) {
        console.error('Error retrieving purchase history:', error)
        res.status(500).send({
                success: false,
                message: 'Error retrieving purchase history'
            }
        )
    }
}




// Opciones del ADMIN

export const addUser = async (req, res) => {
    try {
        let data = req.body
        if (!data.name || !data.surname || !data.username || !data.email || !data.password || !data.phone || !data.role) {
            return res.status(400).send({ message: 'All fields are required' })
        }
        if (!['ADMIN', 'CLIENT'].includes(data.role)) {
            return res.status(400).send({ message: 'Invalid role' })
        }
        let existingEmail = await User.findOne({ email: data.email })
        if (existingEmail) {
            return res.status(400).send({ message: 'Email is already taken' })
        }
        let existingUsername = await User.findOne({ username: data.username })
        if (existingUsername) {
            return res.status(400).send({ message: 'Username is already taken' })
        }
        let newUser = new User(data)
        newUser.password = await encrypt(newUser.password)
        await newUser.save()
        return res.send({ message: `User added successfully, username: ${newUser.username}, role: ${newUser.role}` })
    } catch (err) {
        console.error('Error adding user:', err)
        return res.status(500).send({ message: 'General error with adding user', err })
    }
}

export const getAll = async (req, res) => {
    try {
        const users = await User.find({ status: true }).select('-password')
        return res.send(users)
    } catch (error) {
        console.error('Error retrieving users:', error)
        return res.status(500).send({
            success: false,
            message: 'Error retrieving users'
        })
    }
}


export const updateUserRole = async (req, res) => {
    try {
        const { uid, role } = req.body
        if (!uid) {
                return res.status(400).send({
                    success: false,
                    message: 'User ID is required'
                }
            )
        }
        if (!['ADMIN', 'CLIENT'].includes(role)) {
                return res.status(400).send({
                    success: false,
                    message: 'Invalid role'
                }
            )
        }
        if (!mongoose.Types.ObjectId.isValid(uid)) {
                return res.status(400).send({
                    success: false,
                    message: 'Invalid user ID format'
                }
            )
        }
        const user = await User.findById(uid)
        if (!user) {
                return res.status(404).send({
                    success: false,
                    message: 'User not found'
                }
            )
        }
        if (user.role === 'ADMIN' && role === 'CLIENT') {
                return res.status(403).send({
                    success: false,
                    message: 'Cannot downgrade an ADMIN to CLIENT'
                }
            )
        }
        if (user.role === 'CLIENT' && role === 'ADMIN') {
                user.role = role
                await user.save()
                return res.send({
                    success: true,
                    message: 'Role updated successfully',
                    user
                }
            )
        }
        if (user.role === 'ADMIN' && role === 'ADMIN') {
                return res.status(400).send({
                    success: false,
                    message: 'User is already an ADMIN'
                }
            )
        }
        if (user.role === 'CLIENT' && role === 'CLIENT') {
                return res.status(400).send({
                    success: false,
                    message: 'User is already a CLIENT'
                }
            )
        }
        } catch (error) {
            console.error('Error updating user role:', error)
            res.status(500).send({
                success: false,
                message: 'General Error',
                error: error.message
            }
        )
    }
}

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
                return res.status(404).send({ 
                    success: false, 
                    message: 'User not found' 
                }
            )
        }
        user.status = false
        await user.save()
            res.send({ 
                success: true, 
                message: 'User deactivated successfully' 
            }
        )
    } catch (error) {
            console.error('Error deactivating user:', error)
            res.status(500).send({ 
                success: false, 
                message: 'General Error' 
            }
        )
    }
}

export const updateUserProfileByAdmin = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send(
                {
                    success: false,
                    message: 'Invalid user ID format' }
            )
        }
        const { name, surname, username, email, phone } = req.body
        if (!name && !surname && !username && !email && !phone) {
            return res.status(400).send(
                {
                    success: false,
                    message: 'Information needed' 
                }
            )
        }
        const user = await User.findById(id);
        if (!user) return res.status(404).send(
            {
                success: false,
                message: 'User not found' 
            }
        )
        if (name) user.name = name
        if (surname) user.surname = surname
        if (username) user.username = username
        if (email) user.email = email
        if (phone) user.phone = phone
        await user.save()
        res.send(
            {
                success: true,
                message: 'Profile updated successfully', user 
            }
        )
    } catch (error) {
        console.error('Error updating user profile:', error)
        res.status(500).send(
            {
                success: false,
                message: 'General Error' 
            }
        )
    }
}