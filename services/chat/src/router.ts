import {Router} from 'express';
import startHandshake from './http-handlers/start-handshake';

const router = Router();
router.post('/start-handshake', startHandshake as any);

export default router;
