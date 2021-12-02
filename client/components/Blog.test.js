import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent } from '@testing-library/react'
import Blog from './Blog'

describe('<Blog />', () => {
  let component

  const addLike = jest.fn()
  const deleteBlog = jest.fn()

  const user = {
    username: 'test'
  }

  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Tester Jack',
    url: 'http://test.com',
    likes: 35,
    user: {
      username: 'test'
    }
  }

  beforeEach(() => {
    component = render(
      <Blog blog={blog} user={user} updateLikes={addLike} removeBlog={deleteBlog}/>
    )
  })

  test('after clicking the view button, blog url and likes are displayed', () => {
    const button = component.getByText('view')
    fireEvent.click(button)

    const div = component.container.querySelector('.togglableContent')
    const blogUrl = component.getByText('http://test.com')
    const blogLikes = component.container.querySelector('.likes')

    expect(div).not.toHaveStyle('display: none')
    expect(blogUrl).toBeDefined()
    expect(blogLikes).toBeDefined()
  })

  test('at start the children are not displayed', () => {
    const div = component.container.querySelector('.togglableContent')

    expect(div).toHaveStyle('display: none')
  })

  test('clicking twice the like button calls event handler twice', () => {
    const button = component.container.querySelector('.like-button')
    fireEvent.click(button)
    fireEvent.click(button)

    expect(addLike.mock.calls).toHaveLength(2)
  })
})