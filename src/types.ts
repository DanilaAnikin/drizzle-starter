export interface CommentReturn {
    id: number,
    text: string,
    author: User
}

export interface User {
    id: number,
    name: string,
    email: string
}

export interface PostReturn {
    id: number,
    title: string,
    content: string,
    author: User
}
