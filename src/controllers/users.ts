import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';
import { validationResult } from 'express-validator';

import HttpError from '../models/http-error';
import { confirmRegistration } from '../shared/emails/emails';
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
import { TokenInterface } from '../shared/types/token';

export interface PostSignupBody {
    email: string;
    password: string;
}

export interface PostLoginBody {
    email: string;
    password: string;
}
export interface PostActivationBody {
    token: string;
}

export const postSignup: RequestHandler = async (req: CustomRequest<PostSignupBody>, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(new HttpError(invalidInputs, 422));
    }

    const { email, password } = req.body;

    const userExist: UserInterface = await User.findOne({ email }).catch(() =>
        next(new HttpError(failedSignup, 500)),
    );

    if (userExist) {
        return next(new HttpError(userExists, 422));
    }

    const hashedPassword = await bcrypt
        .hash(password, 12)
        .catch(() => next(new HttpError(failedSignup, 500)));

    const createdUser = new User({
        email,
        password: hashedPassword,
    });

    await createdUser.save().catch(() => next(new HttpError(failedSignup, 500)));

    const token = jwt.sign({ userId: createdUser.id }, process.env.JWT_SECURITY!, {
        expiresIn: '2h',
    });

    await sgMail
        .send(confirmRegistration({ to: createdUser.email, token }))
        .catch((error) => next(new HttpError(failedSignup, 500)));

    res.status(201).json({});
};

export const postLogin: RequestHandler = async (req: CustomRequest<PostLoginBody>, res, next) => {
    const { email, password } = req.body;

    const userExist: UserInterface = await User.findOne({ email }).catch(() =>
        next(new HttpError(failedLogin, 500)),
    );

    if (!userExist) {
        return next(new HttpError(invalidUser, 403));
    }

    const isValidPassword = await bcrypt
        .compare(password, userExist.password)
        .catch(() => next(new HttpError(failedLogin, 500)));

    if (!isValidPassword) {
        return next(new HttpError(invalidPassword, 401));
    }

    const token = jwt.sign(
        { userId: userExist.id, email: userExist.email },
        process.env.JWT_SECURITY!,
        { expiresIn: '1h' },
    );

    res.json({ userId: userExist.id, email: userExist.email, token });
};

export const postActivation: RequestHandler = async (
    req: CustomRequest<PostActivationBody>,
    res,
    next,
) => {
    const { token } = req.body;

    let verifyToken;
    try {
        verifyToken = jwt.verify(token, process.env.JWT_SECURITY!) as {
            exp: number;
            iat: number;
            userId: string;
        };
    } catch (error) {
        return next(new HttpError(invalidPassword, 401));
    }
    if (verifyToken.exp * 1000 < Date.now()) {
        return next(new HttpError(invalidPassword, 401));
    }
    res.status(201).json({ message: 'Account activated!' });
};
