var lodash = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const score = (sum, blog) => sum + blog.likes

  return blogs.length === 0
      ? 0
      : blogs.reduce(score, 0)
}

const favoriteBlog = (blogs) => {
  const likes = blogs.map(blog => blog.likes)
  const max = likes.reduce((a,b) => Math.max(a, b))
  const index = likes.indexOf(max)
  const favorite = {
    title: blogs[index].title,
    author: blogs[index].author,
    likes:blogs[index].likes
  }
  //console.log('Favorite Blog ', favorite)
  return favorite
}

const mostBlogs = (blogs) => {
  const sorted = lodash.sortBy(blogs, ['author'])
  const counts = lodash.countBy(sorted, 'author')
  const keys = lodash.keys(counts)
  const values = lodash.values(counts)
  const highest = values.reduce((a, b) => Math.max(a, b))
  const indexHighest = values.indexOf(highest)
  
  const result = {
      author: keys[indexHighest],
      blogs: values[indexHighest]
  }
  //console.log('Most Blogs' , result)
  return result
}

const mostLikes = (blogs) => {
  const sum = blogs.reduce((a, b) => {
    a[b.author] = a[b.author] || 0
    a[b.author] = a[b.author] + (b.likes)
    return a
  }, {})
     
  const result = lodash.keys(sum)
      .map(x => ({ author: x, likes: sum[x] }))
      .reduce((highest, entry) =>
          highest === null || entry.likes > highest.likes
              ? entry
              : highest
      , null)
  return result
}
module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}
