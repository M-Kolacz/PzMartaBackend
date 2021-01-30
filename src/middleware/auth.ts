import { RequestHandler } from '../shared/types/requests';
import { verifyToken } from '../shared/utils/jwt';
import HttpError from '../models/http-error';

export const authMiddleware: RequestHandler = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return next(new HttpError('Authentication failed.', 422));
        }
        const { userId } = verifyToken(token);
        req.userData = { userId };
    } catch (err) {
        return next(new HttpError('Authentication failed!', 403));
    }
};
