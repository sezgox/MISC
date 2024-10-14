export type Project = {
    _id?: string
    title: string,
    genre?: string,
    description?: string,
    media?: string[],
    responsabilities?: string[],
    skills?: string[],
    links?:{name: string,url: string}[],
    others?: string[],
    file?: string,
    date: string
}

export type ProjectForm = {
    id?: string,
    title: string,
    genre?: string,
    description?: string,
    responsabilities?: string[],
    links?:{name: string,url: string}[]
    skills?: string[],
    others?: string[],
    date: string
}