import { ErrorRequestHandler } from '../shared/ts/types';

export const errorMiddleware: ErrorRequestHandler = (error, req, res, next) => {
    const { statusCode = 500, message = '' } = error;

    res.status(statusCode).json({ message });
};
