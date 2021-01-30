import { Router } from 'express';
import { check } from 'express-validator';

import { postSignup, postLogin } from '../controllers/users';

const router = Router();

router.post(
    '/signup',
    [
        check('name').isLength({ min: 5 }),
        check('email').normalizeEmail({ gmail_remove_dots: false }).isEmail(),
        check('password').isStrongPassword(),
    ],
    postSignup,
);

router.post('/login', postLogin);

export default router;
