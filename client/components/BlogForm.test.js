import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import BlogForm from './BlogForm'

// Make a test for the new blog form. The test should check, that the form calls the event handler it received as props with the right details when a new blog is created.

test('<BlogForm /> calls onSubmit with the right details', () => {
  const addBlog = jest.fn()

  const component = render(
    <BlogForm createBlog={addBlog} />
  )

  const blogTitle = component.container.querySelector('#title')
  const blogAuthor = component.container.querySelector('#author')
  const blogUrl = component.container.querySelector('#url')
  const form = component.container.querySelector('form')

  fireEvent.change(blogTitle, {
    target: { value: 'testing of forms could be easier' }
  })
  fireEvent.change(blogAuthor, {
    target: { value: 'Jack the Tester' }
  })
  fireEvent.change(blogUrl, {
    target: { value: 'http://test.com' }
  })
  fireEvent.submit(form)

  expect(addBlog.mock.calls).toHaveLength(1)
  expect(addBlog.mock.calls[0][0].title).toBe('testing of forms could be easier')
  expect(addBlog.mock.calls[0][0].author).toBe('Jack the Tester')
  expect(addBlog.mock.calls[0][0].url).toBe('http://test.com')
  expect(addBlog.mock.calls[0][0].likes).toBe(0)
})