import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

import HttpError from '../models/http-error';
import User, { UserInterface } from '../models/user';
import { RequestHandler, CustomRequest } from '../shared/types/requests';

export interface PostSignupBody {
    name: string;
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
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const { name, email, password } = req.body;

    let userExist: UserInterface;

    try {
        userExist = await User.findOne({ email });
    } catch (error) {
        return next(new HttpError('Signing up failed, please try again later', 500));
    }

    if (userExist) {
        return next(new HttpError('User exists already,please login instead.', 422));
    }
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        return next(new HttpError('Could not create user, please try again.', 500));
    }

    const createdUser = new User({
        name,
        email,
        password: hashedPassword,
    });

    try {
        await createdUser.save();
    } catch (err) {
        return next(new HttpError('Signup failed, please try again ', 500));
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
        return next(new HttpError('Signup failed, please try again', 500));
    }

    res.status(201).json({ userId: createdUser.id, email: createdUser.email, token });
};

export const postLogin: RequestHandler = async (req: CustomRequest<PostLoginBody>, res, next) => {
    const { email, password } = req.body;

    let userExist: UserInterface;
    try {
        userExist = await User.findOne({ email });
    } catch (error) {
        return next(new HttpError('Login in failed, please try again later.', 500));
    }

    if (!userExist) {
        return next(new HttpError('Invalid credentials, could not log you in.', 403));
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, userExist.password);
    } catch (err) {
        return next(
            new HttpError('Could not log you in, please check your credentials and try again', 500),
        );
    }
    if (!isValidPassword) {
        return next(new HttpError('Invalid credentials, could not log you in.', 401));
    }

    let token: string;
    try {
        token = jwt.sign(
            { userId: userExist.id, email: userExist.email },
            process.env.JWT_SECURITY!,
            { expiresIn: '1h' },
        );
    } catch (err) {
        return next(new HttpError('Logging in failed, please try again', 500));
    }

    res.json({ userId: userExist.id, email: userExist.email, token });
};
