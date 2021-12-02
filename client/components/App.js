/* eslint-disable no-console */
import React, { useState, useEffect, useRef } from 'react'
import Blog from 'Components/Blog'
import blogService from '../services/blogs'
import loginService from '../services/login'
import Notification from 'Components/Notification'
import Togglable from 'Components/Togglable'
import BlogForm from 'Components/BlogForm'

const App = () => {
  const [blogs, setBlogs] = useState([])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')

  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const addBlog = async (blogObject) => {
    blogFormRef.current.toggleVisibility()
    try {
      const returnedBlog = await blogService.create(blogObject)
      setMessage(
        `A new blog ${returnedBlog.title} by ${returnedBlog.author} added`
      )
      console.log(returnedBlog)
      setStatus('success')
      setTimeout(() => {
        setMessage(null)
        setStatus(null)
      }, 5000)
      setBlogs(blogs.concat(returnedBlog))
    } catch (exception){
      setMessage('Failed to add blog')
      setStatus('error')
      setTimeout(() => {
        setMessage(null)
        setStatus(null)
      }, 5000)
    }
  }

  const addLike = async (blogObject) => {
    try {
      const returnedBlog = await blogService.update(blogObject, blogObject.id)
      setMessage(
        `Blog ${returnedBlog.title} by ${returnedBlog.author} liked`
      )
      setStatus('success')
      setTimeout(() => {
        setMessage(null)
        setStatus(null)
      }, 2000)
      console.log(returnedBlog)
      console.log('BlogObject', blogObject)
      console.log('Updated blog', returnedBlog)
      setBlogs(blogs.map(blog => blog.id !== blogObject.id ? blog : returnedBlog))
    } catch (exception){
      setMessage('Failed to like blog')
      setStatus('error')
      setTimeout(() => {
        setMessage(null)
        setStatus(null)
      }, 5000)
    }
  }

  const deleteBlog = async (id) => {
    try {
      const returnedBlog = await blogService.remove(id)
      setMessage(
        'Blog removed'
      )
      setStatus('success')
      setTimeout(() => {
        setMessage(null)
        setStatus(null)
      }, 2000)
      console.log(returnedBlog)
      setBlogs(blogs.filter(blog => blog.id !== id))
    } catch (exception){
      setMessage('Failed to remove blog')
      setStatus('error')
      setTimeout(() => {
        setMessage(null)
        setStatus(null)
      }, 3000)
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username, password,
      })
      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setMessage(
        'Wrong username or password'
      )
      setStatus('error')
      setTimeout(() => {
        setMessage(null)
        setStatus(null)
      }, 5000)
    }
  }

  const loginForm = () => (
    <>
      <h2>Log in to application</h2>
      <form onSubmit={handleLogin} className="login-form">
        <div>
        username
          <input
            type="text"
            id="username"
            value={username}
            name="Username"
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
        password
          <input
            type="password"
            id="password"
            value={password}
            name="Password"
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button id="login-button" type="submit">login</button>
      </form>
    </>
  )

  const blogForm = () => (
    <Togglable buttonLabel='create new blog' ref={blogFormRef} >
      <BlogForm createBlog={addBlog} />
    </Togglable>
  )

  const handleClick = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }


  const Logout = () => (
    <button onClick = {handleClick}>
      Logout
    </button>
  )

  // Show the most popular blogs first
  blogs.sort((a, b) => {
    if (a.likes > b.likes) {
      return 1
    }
    if (a.likes < b.likes) {
      return -1
    }
    return 0
  }).reverse()

  return (
    <div>
      <Notification message={message} status={status}/>
      {user === null ?
        loginForm() :
        <div>
          <h2>Blogs</h2>
          <p>{user.name} logged-in <Logout /></p>
          {blogForm()}
        </div>
      }

      <div className="list-of-blogs">
        {blogs.map(blog => <Blog key={blog.id} blog={blog} updateLikes={addLike} removeBlog={deleteBlog} user={user} />)
        }
      </div>
    </div>
  )
}

export default App
