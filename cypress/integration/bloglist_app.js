/* eslint-disable no-undef */
describe('Blog app', function() {
  beforeEach(function() {
    cy.request('POST', 'http://localhost:8000/api/testing/reset')
    const user = {
      name: 'Matti Luukkainen',
      username: 'mluukkai',
      password: 'salainen'
    }
    cy.request('POST', 'http://localhost:8000/api/users/', user)
    cy.visit('http://localhost:8000')
  })

  it('Login form is shown', function() {
    cy.get('.login-form').should('have.css', 'display', 'block')
  })

  describe('Login',function() {
    it('succeeds with correct credentials', function() {
      cy.get('#username').type('mluukkai')
      cy.get('#password').type('salainen')
      cy.get('#login-button').click()

      cy.contains('Matti Luukkainen logged-in')
    })

    it('fails with wrong credentials', function() {
      cy.get('#username').type('mluukkai')
      cy.get('#password').type('wrong')
      cy.get('#login-button').click()

      cy.get('.error')
        .should('contain', 'Wrong username or password')
        .and('have.css', 'color', 'rgb(255, 0, 0)')
        .and('have.css', 'border-style', 'solid')
    })
  })

  describe('When logged in', function() {
    beforeEach(function() {
      cy.get('#username').type('mluukkai')
      cy.get('#password').type('salainen')
      cy.get('#login-button').click()
      // This is not working, so I used the traditional way using the UI
      // cy.login({ username: 'mluukkai', password: 'salainen' })
    })

    it('a blog can be created', function() {
      cy.get('.list-of-blogs').children().should('have.length', 0)
      cy.contains('create new blog').click()
      cy.get('#title').type('a blog created by cypress')
      cy.get('#author').type('Douglas Carneiro')
      cy.get('#url').type('test.com')
      cy.get('#create-blog-button').click()
      cy.contains('a blog created by cypress')
      cy.get('.list-of-blogs').children().should('have.length', 1)
    })

    describe('a blog exists', function () {
      beforeEach(function () {
        cy.login({ username: 'mluukkai', password: 'salainen' })
        cy.createBlog({ title: 'first blog', author: 'Douglas', url: 'test.com', likes: 0 })
      })

      it('a user can like it', function () {
        cy.get('#view-hide-button').click()
        cy.get('.likes')
          .should('contain', 'Likes: 0')
        cy.get('.like-button').click()
        cy.get('.likes')
          .should('contain', 'Likes: 1')
      })

      it('user who created the blog can delete it', function() {
        cy.get('#view-hide-button').click()
        cy.get('.list-of-blogs').children().should('have.length', 1)
        cy.get('#remove-button').click()
        cy.get('.list-of-blogs').children().should('have.length', 0)
      })

      it('user who didn\'t create the blog cannot delete it', function() {
        const user2 = {
          name: 'Douglas Carneiro',
          username: 'dougscar',
          password: 'douglas'
        }
        cy.request('POST', 'http://localhost:8000/api/users/', user2)
        cy.contains('Logout').click()
        cy.login({ username: 'dougscar', password: 'douglas' })
        cy.get('#view-hide-button').click()

        // Make sure there's no word 'remove' in the page, else the test will fail
        cy.get('.list-of-blogs').should('not.contain', 'remove')
      })
    })

    describe.only('a bunch of blogs exist', function () {
      beforeEach(function () {
        cy.login({ username: 'mluukkai', password: 'salainen' })
        cy.createBlog({ title: 'first blog', author: 'Douglas', url: 'test.com', likes: 3 })
        cy.createBlog({ title: 'second blog', author: 'Douglas', url: 'test.com', likes: 25 })
        cy.createBlog({ title: 'third blog', author: 'Douglas', url: 'test.com', likes: 1 })
        cy.createBlog({ title: 'fourth blog', author: 'Douglas', url: 'test.com', likes: 10 })
      })

      it('blogs are sorted by number of likes', function() {
        // This is not the best way to test if the elements are ordered,
        // but I was having difficulties using the library to implement the logic
        cy.get('.likes')
          .should('have.length', 4)
          .then(($els) => {
            // jQuery => Array => get "innerText" from each
            // console.log($els)
            return Cypress._.map(Cypress.$.makeArray($els), 'innerText')
          })
          .should('deep.equal', ['Likes: 25 like ', 'Likes: 10 like ', 'Likes: 3 like ', 'Likes: 1 like '])
      })
    })
  })
})