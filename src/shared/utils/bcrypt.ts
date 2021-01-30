import { NextFunction } from 'express';
import bcrypt from 'bcryptjs';

import HttpError from '../../models/http-error';
import { Error } from '../types/requests';

export interface ComparePasswords {
    password: string;
    hashedPassword: string;
}

export const hashPassword = async (password: string, next: NextFunction, errorType?: Error) => {
    let hashedPassword: string;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        return next(
            new HttpError(
                errorType?.message || 'Invalid inputs passed, please check your data.',
                errorType?.statusCode || 422,
            ),
        );
    }
    return hashedPassword;
};

export const validatePassword = async (
    { password, hashedPassword }: ComparePasswords,
    next: NextFunction,
) => {
    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        return next(
            new HttpError('Could not log you in, please check your credentials and try again', 500),
        );
    }
    if (!isValidPassword) {
        return next(new HttpError('Invalid credentials, could not log you in.', 401));
    }
};
