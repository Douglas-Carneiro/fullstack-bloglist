import React, { useState } from 'react'

const Blog = ({ blog, updateLikes, removeBlog, user }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const [visible, setVisible] = useState(false)
  const showWhenVisible = { display: visible ? '' : 'none' }

  const ViewHideButton = () => (
    <button id="view-hide-button" onClick = {() => setVisible(!visible)}>
      {visible ? 'hide' : 'view' }
    </button>
  )

  const addLike = () => {
    const newLikes = blog.likes + 1

    updateLikes({
      user: blog.user.id,
      author: blog.author,
      title: blog.title,
      url: blog.url,
      likes: newLikes,
      id: blog.id
    })
  }

  const deleteBlog = () => {
    if (window.confirm(`Delete ${blog.title} by ${blog.author}?`)) {
      removeBlog(blog.id)
    }
  }

  const LikeButton = () => (
    <button className="like-button" onClick={addLike}>
      like
    </button>
  )

  const RemoveButton = () => {
    if ((user) && (blog.user.username === user.username)) {
      return (<button id="remove-button" onClick={deleteBlog}> remove </button>)
    }
    else return null
  }

  if ((!blog.url.startsWith('http://')) && (!blog.url.startsWith('https://'))) {
    blog.url = 'http://'.concat(blog.url)
  }

  if (blog.user) {
    return (
      <div style={blogStyle}>
        <div>
          {blog.title} - {blog.author} <ViewHideButton />
        </div>
        <div style={showWhenVisible} className="togglableContent">
          <a href={blog.url}>{blog.url}</a>
          <p className="likes">Likes: {blog.likes} <LikeButton /> </p>
          <p>{blog.user.name}</p>
          <RemoveButton />
        </div>
      </div>
    )
  } else {
    return (
      <div style={blogStyle}>
        <div>
          {blog.title} - {blog.author} <ViewHideButton />
        </div>
        <div style={showWhenVisible} className="togglableContent">
          <a href={blog.url}>{blog.url}</a>
          <p className="likes">Likes: {blog.likes} <LikeButton /> </p>
          <p>No user,created in tests</p>
        </div>
      </div>
    )
  }

}

export default Blog