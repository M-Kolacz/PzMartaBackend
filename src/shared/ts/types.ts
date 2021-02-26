import { Request, Response, NextFunction } from 'express';

import { IBodyRequest, IToken, IError } from './interfaces';

export type ErrorRequestHandler = (
    err: IError,
    req: Request,
    res: Response,
    next: NextFunction,
) => any;

export type RequestHandler = (req: Request, res: Response, next: NextFunction) => any;

export type RequestBodyHandler<T> = (
    req: IBodyRequest<T>,
    res: Response,
    next: NextFunction,
) => any;

export type CustomToken<T> = IToken & { [P in keyof T]: T[P] };
