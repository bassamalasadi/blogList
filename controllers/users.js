const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.get('/', async (req, res, next) => {
    try {
        const users = await User.find({}).populate('blogs', {title:1, url:1, author:1})
        res.json(users.map(user => user.toJSON()))
    } catch (exception) {
        next(exception)
    }
})
userRouter.get('/:id', async(req,res,next) => {
    try {
        const user = await User.findById(req.params.id).populate('blog')
        res.status(200).json(user)
    }catch(error) {
        next(error)
    }
})
userRouter.post('/', async (req, res, next) => {
    try {
        const body = req.body
        if (body.password.length < 3) {
            throw new Error('Password is too short!')
        }
        const saltRounds = 10
        const passwordHash = await bcrypt.hash(body.password, saltRounds)

        const user = new User({
            name: body.name,
            username: body.username,
            passwordHash,
        })

        const savedUser = await user.save()
        res.json(savedUser)
    } catch (exception) {
        next(exception)
    }
})


module.exports = userRouter