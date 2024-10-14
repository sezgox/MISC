export type SuccessResponse<T> = {
    success: true,
    data: T
}

export type ErrorResponse = {
    success: false
    error: string
}

//USER PROFILES
export type UserInfo = {
    uid: string,
    username: string,
    createdAt: string,
}

export type MovieInfoDB = {
    uid: string,
    mid: number,
    rate: number
}



export type UserExists = SuccessResponse<UserInfo> | ErrorResponse

export type MovieOnList =  SuccessResponse<MovieInfoDB> | ErrorResponse

export type SimpleResponse = SuccessResponse<string> | ErrorResponse

export type MoviesWatchedList = SuccessResponse<any[]> | ErrorResponse
