const Blog = require('../models/blog')
const User = require('../models/user')
const initialBlogs = [
    {
        title: 'first blog',
        author: 'mekko',
        url: 'totalre.com',
        likes: 55
    },
    {
        title: 'second blog',
        author: 'juha',
        url: 'google.com',
        likes: 100
    },
    {
        title: 'third blog',
        author: 'sami',
        url: 'google.com',
        likes: 400
    }
]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}
const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}



module.exports = {
    initialBlogs,
    blogsInDb,
    usersInDb
   
}