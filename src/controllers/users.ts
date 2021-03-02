import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';
import { validationResult } from 'express-validator';

import HttpError from '../models/http-error';
import User, { IUser } from '../models/user';
import { isTokenExpired } from '../shared/utils/tokenExpiration';
import { confirmRegistration } from '../shared/emails';
import {
    invalidInputs,
    failedSignup,
    userExists,
    failedLogin,
    invalidUser,
    invalidPassword,
    failedActivation,
} from '../shared/SSOT/ErrorMessages/user';
import { RequestBodyHandler, CustomToken } from '../shared/ts/types';

interface ISignupBody {
    email: string;
    password: string;
}

interface ILoginBody {
    email: string;
    password: string;
}

interface IActivationBody {
    token: string;
}

interface IActivationToken {
    email: string;
    password: string;
}

export const postSignup: RequestBodyHandler<ISignupBody> = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(new HttpError(invalidInputs, 422));
    }

    const { email, password } = req.body;

    const userExist = await User.findOne({ email }).catch(() => next(new HttpError(failedSignup, 500)));

    if (userExist) {
        return next(new HttpError(userExists, 422));
    }

    const hashedPassword = await bcrypt.hash(password, 12).catch(() => next(new HttpError(failedSignup, 500)));

    const token = jwt.sign({ email, password: hashedPassword }, process.env.JWT_SECURITY!, {
        expiresIn: '2h',
    });

    sgMail.send(confirmRegistration({ to: email, token })).catch((error) => next(new HttpError(failedSignup, 500)));

    res.status(201).json({ message: 'Email został wysłany' });
};

export const postActivation: RequestBodyHandler<IActivationBody> = async (req, res, next) => {
    const { token } = req.body;

    let verifyToken;
    try {
        verifyToken = jwt.verify(token, process.env.JWT_SECURITY!) as CustomToken<IActivationToken>;
    } catch (error) {
        return next(new HttpError(failedActivation, 401));
    }

    if (isTokenExpired(verifyToken)) {
        return next(new HttpError(failedActivation, 401));
    }

    const UserExists = await User.findOne({ email: verifyToken.email }).catch(() =>
        next(new HttpError(failedActivation, 401)),
    );
    if (UserExists) {
        return next(new HttpError('Użytkownik istnieje', 422));
    }

    const NewUser = new User({
        email: verifyToken.email,
        password: verifyToken.password,
    });

    await NewUser.save().catch(() => next(new HttpError(failedActivation, 401)));

    const authToken = jwt.sign({ userId: NewUser.id, email: NewUser.email }, process.env.JWT_SECURITY!, {
        expiresIn: '1h',
    });

    res.status(201).json({ userId: NewUser.id, token: authToken });
};

export const postLogin: RequestBodyHandler<ILoginBody> = async (req, res, next) => {
    const { email, password } = req.body;

    const userExist = await User.findOne({ email }).catch(() => next(new HttpError(failedLogin, 500)));

    if (!userExist) {
        return next(new HttpError(invalidUser, 403));
    }

    const isValidPassword = await bcrypt
        .compare(password, userExist.password)
        .catch(() => next(new HttpError(failedLogin, 500)));

    if (!isValidPassword) {
        return next(new HttpError(invalidPassword, 401));
    }

    const token = jwt.sign({ userId: userExist.id, email: userExist.email }, process.env.JWT_SECURITY!, {
        expiresIn: '1h',
    });

    res.json({ userId: userExist.id, token });
};
