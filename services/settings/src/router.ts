import {Router} from "express";
import settingsInterface from './http-handlers/settings_security_handler';
import reportCreationInterface from './http-handlers/report_creation_handler';
const router = Router();

router.use('/security-settings', settingsInterface);
router.use('/report-creation', reportCreationInterface);
export default router;