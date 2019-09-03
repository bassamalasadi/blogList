const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('../test/help_test')

beforeEach(async () => {
  await Blog.deleteMany({})

  let blogObject = new Blog(helper.initialBlogs[0])
  await blogObject.save()

  blogObject = new Blog(helper.initialBlogs[1])
  await blogObject.save()

  blogObject = new Blog(helper.initialBlogs[2])
  await blogObject.save()
})

describe('Testing initial blogs', () => {
  test('All blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body.length).toBe(helper.initialBlogs.length)
  })

  test('Content type is JSON', async () => {
      await api
          .get('/api/blogs')
          .expect(200)
          .expect('Content-Type', /application\/json/)
  })

  test('Identification is labeled correctly', async () => {
      const response = await api.get('/api/blogs')
      expect(response.body[0].id).toBeDefined()
  })
})

describe('Adding a new blog', () => {
    test('A new blog is added correctly', async () => {
        const newBlog = {
            title: 'no one can do it',
            author: 'bassam',
            url: 'never.com',
            likes: 20
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsNow = await helper.blogsInDb()
        expect(blogsNow.length).toBe(helper.initialBlogs.length + 1)
        const noIds = blogsNow.map(blog => ({ title: blog.title, author: blog.author, url: blog.url, likes: blog.likes }))
        expect(noIds).toContainEqual(newBlog)
    })

    test('Likes values is missing', async () => {
        const newBlog = {
            title: 'never happened again',
            author: 'chris',
            url: 'TPI.com'
        }
        
        const response = await api.post('/api/blogs').send(newBlog)
        expect(response.body.likes).toBe(0)
    })

    test('title and url properties are missing', async () => {
        const newBlog = {
            author: 'juha',
            likes: 9
        }

        const response = await api.post('/api/blogs').send(newBlog)
        expect(response.status).toBe(401)
    })
})

describe('Deleting a blog', () => {
    test('Deleting a specific blog', async () => {
        const blogsStart = await helper.blogsInDb()
        const blogDelete = blogsStart[0]

        await api
            .delete(`/api/blogs/${blogDelete.id}`)
            .expect(204)

        const blogsEnd = await helper.blogsInDb()
        expect(blogsEnd.length).toBe(helper.initialBlogs.length - 1)

        const ids = blogsEnd.map(blog => blog.id)
        expect(ids).not.toContain(blogDelete.id)
    })
})
 
describe('Updating an existing blog', () => {
    test('Update likes', async () => {
        const blogsStart = await helper.blogsInDb()
        const blogUpdate = blogsStart[blogsStart.length - 1]
        const likes = blogUpdate.likes
        blogUpdate.likes = likes + 100

        const response = await api.put(`/api/blogs/${blogUpdate.id}`).send(blogUpdate)
        expect(response.status).toBe(200)
        expect(response.body.likes).toBe(likes + 100)
    })
})
describe('Adding a new user', () => {
    test('with too short username fails', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            name: 'Pete',
            username: 'CC',
            password: 'collective'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('is shorter than')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd.length).toBe(usersAtStart.length)
    })

    test('with too short password fails', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            name: 'Pete',
            username: 'Collective',
            password: 'CC'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('is too short')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd.length).toBe(usersAtStart.length)
    })
})

afterAll(() => {
    mongoose.connection.close()
  })