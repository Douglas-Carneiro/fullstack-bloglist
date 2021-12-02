// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (previousValue, currentValue) => previousValue + currentValue.likes

  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const max = Math.max(...blogs.map(blog => blog.likes))

  const favorite = blogs.find(blog => blog.likes >= max)

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
  }
}

const mostBlogs = (blogs) => {
  const occurrences = blogs.map(blog => blog.author).reduce(function (acc, curr) {
    return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
  }, {})

  const max = Math.max(...Object.values(occurrences))

  let maxIndex = Object.values(occurrences).indexOf(max)

  return { author: Object.keys(occurrences)[maxIndex], blogs: max }
}

const mostLikes = (blogs) => {
  const occurrences = blogs.map(blog => blog).reduce(function (acc, curr) {
    return acc[curr.author] ? acc[curr.author] += curr.likes : acc[curr.author] = curr.likes, acc
  }, {})

  const max = Math.max(...Object.values(occurrences))

  let maxIndex = Object.values(occurrences).indexOf(max)

  return { author: Object.keys(occurrences)[maxIndex], likes: max }
}

// function getNumberOfBlogs(element) {
//   counts[element] = counts[element] ? counts[element] + 1 : 1;
// }

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}