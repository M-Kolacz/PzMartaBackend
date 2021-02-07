import { Router } from 'express';

import { postSignup, postLogin } from '../controllers/users';
import { LOGIN_ROUTE, SIGNUP_ROUTE } from './paths/userPaths';
import { signupValidator } from './validators/userValidators';

const router = Router();

router.post(SIGNUP_ROUTE, signupValidator, postSignup);

router.post(LOGIN_ROUTE, postLogin);

export default router;
