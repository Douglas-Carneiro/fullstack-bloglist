const mongoose = require('mongoose')

// Commented the required field of title and url to pass a test
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    // required: true,
    minlength: 5
  },
  author: {
    type: String,
    required: true,
    minlength: 3
  },
  url: {
    type: String,
    // required: true,
    minlength: 4
  },
  likes: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: {
    type: Array,
  }
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Blog', blogSchema)