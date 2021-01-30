import { Request, Response, NextFunction } from 'express';

export interface Error {
    statusCode?: number;
    message?: string;
}

export type ErrorRequestHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) => any;

export type RequestHandler = (req: Request, res: Response, next: NextFunction) => any;

export interface CustomRequest<T> extends Request {
    body: T;
}
