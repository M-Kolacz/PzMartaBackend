import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { TokenInterface } from '../types/token';
import HttpError from '../../models/http-error';
import { Error } from '../types/requests';

export const createToken = (
    tokenData: TokenInterface,
    next: NextFunction,
    options?: jwt.SignOptions | undefined,
    errorType?: Error,
) => {
    let token: string;

    try {
        token = jwt.sign(tokenData, 'supersecret_dont_share', options);
    } catch (err) {
        return next(
            new HttpError(
                errorType?.message || 'Invalid inputs passed, please check your data.',
                errorType?.statusCode || 422,
            ),
        );
    }
    return token;
};
export const verifyToken = (token: string) => {
    return jwt.verify(token, 'supersecret_dont_share') as TokenInterface;
};
