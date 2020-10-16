import {Router} from "express";
import settingsInterface from './http-handlers/settings_security_handler';

const router = Router();

router.use('/security-settings', settingsInterface);

export default router;