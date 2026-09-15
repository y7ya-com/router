import axios from 'redaxios'

export type PostType = {
  id: string
  title: string
  body: string
}

export class NotFoundError extends Error {}

export async function fetchPost(postId: string) {
  const post = await axios
    .get<PostType>(`https://jsonplaceholder.typicode.com/posts/${postId}`)
    .then((r) => r.data)
    .catch((err) => {
      if (err.status === 404) {
        throw new NotFoundError(`Post with id "${postId}" not found!`)
      }
      throw err
    })
  return post
}

export async function fetchPosts() {
  return axios
    .get<Array<PostType>>('https://jsonplaceholder.typicode.com/posts')
    .then((r) => r.data.slice(0, 10))
}
