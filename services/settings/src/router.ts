import {Router} from "express";
import settingsInterface from './http-handlers/settings_security_handler';
import reportCreationInterface from './http-handlers/report_creation_handler';
const router = Router();

router.use('/settings/security', settingsInterface);
router.use('/settings/report-reasons', reportCreationInterface);
export default router;