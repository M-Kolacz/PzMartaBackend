import { isValidRequest } from '../shared/utils/express-validator';
import { hashPassword, validatePassword } from '../shared/utils/bcrypt';
import { createToken } from '../shared/utils/jwt';

import { RequestHandler, CustomRequest } from '../shared/types/requests';
import User, { UserInterface } from '../models/user';
import HttpError from '../models/http-error';

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
    isValidRequest(req, next);

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

    const hashedPassword = await hashPassword(password, next);

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

    const token = createToken({ userId: createdUser.id, email: createdUser.email }, next, {
        expiresIn: '1h',
    });

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

    await validatePassword({ password, hashedPassword: userExist.password }, next);

    const token = createToken({ userId: userExist.id, email: userExist.email }, next, {
        expiresIn: '1h',
    });

    res.json({ userId: userExist.id, email: userExist.email, token });
};
