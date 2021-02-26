import jwt from 'jsonwebtoken';

import HttpError from '../models/http-error';
import { failedAuthentication } from '../shared/SSOT/ErrorMessages/authMiddleware';

import { RequestHandler, CustomToken } from '../shared/ts/types';

export interface IAuthToken {
    userId: string;
}

export const authMiddleware: RequestHandler = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return next(new HttpError(failedAuthentication, 422));
        }
        const { userId } = jwt.verify(token, process.env.JWT_SECURITY!) as CustomToken<IAuthToken>;

        req.userData = { userId };
    } catch (err) {
        return next(new HttpError(failedAuthentication, 403));
    }
};
