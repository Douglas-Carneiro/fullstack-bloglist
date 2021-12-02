const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../index')
const api = supertest(app)

const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')

jest.setTimeout(100000)

// Populates the test database before the tests
beforeEach(async () => {
  await Blog.deleteMany({})

  // This code executes each item in the order it appears
  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }

  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })

  await user.save()
})

describe('when there is initially some notes saved', () => {
  test('all blogs are returned', async () => {
    const response = await api.get('/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  }, 100000)

  test('unique identifier is named "id"', async () => {
    const response = await api.get('/blogs/5a422aa71b54a676234d17f8')

    expect(response.body.id).toBeDefined()
  })
})

describe('Addition of a blog:', () => {
  test('a valid blog is added', async () => {
    const newBlog = {
      title: 'Valid blog test',
      author: 'Author test',
      url: 'test.com',
      likes: 5
    }
    const credentials = { username: 'root', password: 'sekret' }
    const result = await api
      .post('/login')
      .send(credentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    let token = result.body.token

    await api
      .post('/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).toContain(
      'Valid blog test'
    )
  })

  test('fails if a token is not provided', async () => {
    const newBlog = {
      title: 'Fail blog test',
      author: 'Author test',
      url: 'test.com',
      likes: 5
    }

    const result = await api
      .post('/blogs')
      .send(newBlog)
      .expect(401)

    expect(result.body.error).toContain('token missing')

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('if "likes:" is missing in the request it will be zero', async () => {
    const newBlog = {
      title: 'Valid blog test',
      author: 'Author test',
      url: 'test.com'
    }
    const credentials = { username: 'root', password: 'sekret' }
    const result = await api
      .post('/login')
      .send(credentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    let token = result.body.token

    await api
      .post('/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()

    const createdBlog = blogsAtEnd.find(b => b.title === 'Valid blog test')
    expect(createdBlog.likes).toEqual(0)
  })

  test('fails if a blog is missing title and url', async () => {
    const newBlog = {
      author: 'Author test',
      likes: 35
    }
    const credentials = { username: 'root', password: 'sekret' }
    const result = await api
      .post('/login')
      .send(credentials)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    let token = result.body.token

    // eslint-disable-next-line no-unused-vars
    const response = await api
      .post('/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length
    )
  })
})

describe('deletion of a blog', () => {
  let result
  let headers
  beforeEach(async () => {
    const newUser = {
      username: 'janedoez',
      name: 'Jane Z. Doe',
      password: 'password',
    }

    await api
      .post('/users')
      .send(newUser)

    const credentials = await api
      .post('/login')
      .send(newUser)

    headers = {
      'Authorization': `bearer ${credentials.body.token}`
    }

    const newBlog = {
      title: 'Great developer experience',
      author: 'Hector Ramos',
      url: 'https://jestjs.io/blog/2017/01/30/a-great-developer-experience',
      likes: 7
    }

    result = await api
      .post('/blogs')
      .send(newBlog)
      .set(headers)
  })
  test('succeeds with status code 204 if id is valid', async () => {
    const aBlog = result.body

    const initialBlogs = await helper.blogsInDb()
    const response = await api
      .delete(`/blogs/${aBlog.id}`)
      .set(headers)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    // eslint-disable-next-line no-console
    console.log('blogs at start: ', initialBlogs.length)
    // eslint-disable-next-line no-console
    console.log('blogs at end: ', blogsAtEnd.length)
    // eslint-disable-next-line no-console
    console.log('Response: ', response.status)

    expect(blogsAtEnd).toHaveLength(
      initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(b => b.title)

    expect(titles).not.toContain(aBlog.title)
  })
})

describe('Change of a blog', () => {
  test('succeeds for only changing the likes of a blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const blogToUpdateCopy = { ...blogToUpdate }
    // Number of likes different from blogToUpdate
    blogToUpdateCopy.likes = 7

    await api
      .put(`/blogs/${blogToUpdate.id}`)
      .send(blogToUpdateCopy)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    const updatedBlog = blogsAtEnd.find(b => b.title === blogToUpdate.title)
    expect(updatedBlog.likes).toEqual(blogToUpdateCopy.likes)
  })
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

describe('when creating a user', () => {
  test('invalid users are not created', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'rt',
      name: 'Superuser',
      password: 'sn',
    }

    const result = await api
      .post('/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('both username and password must be at least 3 characters long')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

// Executes after all tests are done
afterAll(() => {
  mongoose.connection.close()
})