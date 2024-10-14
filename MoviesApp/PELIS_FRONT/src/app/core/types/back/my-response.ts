import { UserInfo } from "../users/users-types"


export type SuccessResponse<T> = {
    success: true,
    data: T
}

export type ErrorResponse = {
    success: false
    error: string
}

export type UserResponse = SuccessResponse<UserInfo> | ErrorResponse;

export type SimpleResponse = SuccessResponse<string> | ErrorResponse;

export type MovieListResponse<T> = SuccessResponse<T> | ErrorResponse;
