import { validationResult } from 'express-validator';
import { ErrorRequestHandler, NextFunction, Request } from 'express';

import HttpError from '../../models/http-error';
import { Error } from '../types/requests';

export const isValidRequest = (req: Request, next: NextFunction, errorType?: Error) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError(
                errorType?.message || 'Invalid inputs passed, please check your data.',
                errorType?.statusCode || 422,
            ),
        );
    }
};
