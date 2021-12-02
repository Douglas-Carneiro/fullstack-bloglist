const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../util/middleware')

// No need to catch errors in the routes, the express-async-errors lib handles that

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 , id: 1 })

  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.post('/:id/comments', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  const comment = request.body.comment

  blog.comments = blog.comments.concat(comment)

  await blog.save()
  response.json({ comment })
})


blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body
  const likes = body.likes ? body.likes : 0

  const user = request.user

  if (!(body.title || body.url)) {
    return response.status(400).send({
      error: 'title and url are required'
    })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: likes,
    user: user._id
  })

  // Mutation of state so the remove button can be shown upon creating a new blog,
  // before this the button only appeared after a page refresh
  let savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  savedBlog = await Blog
    .findById(savedBlog._id).populate('user', { username: 1, name: 1 , id: 1 })
  await user.save()
  response.json(savedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const user = request.user
  const blog = await Blog.findById(request.params.id)

  if (blog.user.toString() === user.id) {
    await blog.delete()
    response.status(204).end()
  } else {
    return response.status(401).json({ error: 'failed deletion: user cannot delete blogs he did not create' })
  }

})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlog)
})

module.exports = blogsRouter