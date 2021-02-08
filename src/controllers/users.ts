import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

import HttpError from '../models/http-error';
import User, { UserInterface } from '../models/user';
import {
    invalidInputs,
    failedSignup,
    userExists,
    failedLogin,
    invalidUser,
    invalidPassword,
} from '../shared/SSOT/ErrorMessages/user';
import { RequestHandler, CustomRequest } from '../shared/types/requests';

export interface PostSignupBody {
    email: string;
    password: string;
}

export interface PostLoginBody {
    email: string;
    password: string;
}

export const postSignup: RequestHandler = async (req: CustomRequest<PostSignupBody>, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(new HttpError(invalidInputs, 422));
    }

    const { email, password } = req.body;

    let userExist: UserInterface;

    try {
        userExist = await User.findOne({ email });
    } catch (error) {
        return next(new HttpError(failedSignup, 500));
    }

    if (userExist) {
        return next(new HttpError(userExists, 422));
    }
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        return next(new HttpError(failedSignup, 500));
    }

    const createdUser = new User({
        email,
        password: hashedPassword,
    });

    try {
        await createdUser.save();
    } catch (err) {
        return next(new HttpError(failedSignup, 500));
    }

    let token: string;
    try {
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            process.env.JWT_SECURITY!,
            {
                expiresIn: '1h',
            },
        );
    } catch (err) {
        return next(new HttpError(failedSignup, 500));
    }

    res.status(201).json({ userId: createdUser.id, email: createdUser.email, token });
};

export const postLogin: RequestHandler = async (req: CustomRequest<PostLoginBody>, res, next) => {
    const { email, password } = req.body;

    let userExist: UserInterface;
    try {
        userExist = await User.findOne({ email });
    } catch (error) {
        return next(new HttpError(failedLogin, 500));
    }

    if (!userExist) {
        return next(new HttpError(invalidUser, 403));
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, userExist.password);
    } catch (err) {
        return next(new HttpError(failedLogin, 500));
    }
    if (!isValidPassword) {
        return next(new HttpError(invalidPassword, 401));
    }

    let token: string;
    try {
        token = jwt.sign(
            { userId: userExist.id, email: userExist.email },
            process.env.JWT_SECURITY!,
            { expiresIn: '1h' },
        );
    } catch (err) {
        return next(new HttpError(failedLogin, 500));
    }

    res.json({ userId: userExist.id, email: userExist.email, token });
};
