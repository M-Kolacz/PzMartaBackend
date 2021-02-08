import { check } from 'express-validator';

export const signupValidator = [
    check('email').normalizeEmail({ gmail_remove_dots: false }).isEmail(),
    check('password').isStrongPassword(),
];
