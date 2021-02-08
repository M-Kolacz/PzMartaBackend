import jwt from 'jsonwebtoken';

import { failedAuthentication } from '../shared/SSOT/ErrorMessages/authMiddleware';
import { TokenInterface } from '../shared/types/token';
import { RequestHandler } from '../shared/types/requests';
import HttpError from '../models/http-error';

export const authMiddleware: RequestHandler = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return next(new HttpError(failedAuthentication, 422));
        }
        const { userId } = jwt.verify(token, process.env.JWT_SECURITY!) as TokenInterface;

        req.userData = { userId };
    } catch (err) {
        return next(new HttpError(failedAuthentication, 403));
    }
};
