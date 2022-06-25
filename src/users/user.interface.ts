import Post from "../posts/posts.interface"
interface User {
  _id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  password: string
  twoFactorAuthenticationCode?: string
  isTwoFactorAuthenticationEnabled?: boolean
  address?: {
    street: string
    city: string
  }
  posts?: Post[]
}

export default User
