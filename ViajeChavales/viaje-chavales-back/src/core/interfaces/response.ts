import { HttpException } from "@nestjs/common";

export type HttpResponse<T> = HttpException | T;