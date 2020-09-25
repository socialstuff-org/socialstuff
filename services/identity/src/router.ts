import {Router}        from 'express';
import login           from './http-handlers/login';
import publicKeyOf     from './http-handlers/public-key-of';
import register        from './http-handlers/register';
import registerConfirm from './http-handlers/register-confirm';


const router = Router();

router.post('/register/confirm', registerConfirm);
router.post('/register', register);
router.post('/login', login);
router.get('/public-key-of/:username', publicKeyOf);

export default router;
