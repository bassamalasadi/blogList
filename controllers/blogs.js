const blogsRouter = require ('express').Router()
const Blog = require ('../models/blog')
const User = require ('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async(req,res) => {
    const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})
    res.status(200).json(blogs.map(blog => blog.toJSON()))
})
blogsRouter.get('/:id', async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('user')
        res.status(200).json(blog)
    } catch (error) {
        next(error)
    }
})
blogsRouter.post('/', async (req, res, next) => {
    const body = req.body
    try {
        const decodedToken = jwt.verify(req.token, process.env.SECRET)
        if (!req.token || !decodedToken.id) {
            return res.status(401).json({ error: 'token missing or invalid' })
        }
        const user = await User.findById(decodedToken.id)
        var blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes,
            user: user
        })
        if (blog.likes === undefined) {
            blog.likes = 0
        }
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
        res.status(201).json(savedBlog.toJSON())
    } catch (exception) {
        next(exception)
    }
})
blogsRouter.delete('/:id', async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id)
        const decodedToken = jwt.verify(req.token, process.env.SECRET)
        if (!req.token || !decodedToken.id) {
            return res.status(401).json({ error: 'token missing' })
        }
        const user = await User.findById(decodedToken.id)
        if (blog.user.toString() === user._id.toString()) {
            await Blog.findByIdAndRemove(req.params.id)
            user.blogs = user.blogs.filter(b => b.id !== blog.id)
            res.status(204).end()
        } else {
            return res.status(401).json({ error: 'token invalid' })
        }
    } catch (exception) {
        next(exception)
    }
})

blogsRouter.put('/:id', async (req, res, next) => {
    const blog = new Blog(req.body)
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, { likes: blog.likes }, { new: true }).populate('user')
        res.status(200).json(updatedBlog.toJSON())
    } catch (exception) {
        next(exception)
    }
})
module.exports = blogsRouter