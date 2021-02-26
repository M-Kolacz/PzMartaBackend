import { Request } from 'express';

export interface IError {
    statusCode?: number;
    message?: string;
}

export interface IBodyRequest<T> extends Request {
    body: T;
}

export interface IToken {
    exp: number;
    iat: number;
}
