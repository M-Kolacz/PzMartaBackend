import { Router } from 'express';

import { postSignup, postLogin, postActivation } from '../controllers/users';
import { LOGIN_ROUTE, SIGNUP_ROUTE, ACTIVATION_ROUTE } from './paths/userPaths';
import { signupValidator } from './validators/userValidators';

const router = Router();

router.post(SIGNUP_ROUTE, signupValidator, postSignup);

router.post(ACTIVATION_ROUTE, postActivation);

router.post(LOGIN_ROUTE, postLogin);

export default router;
