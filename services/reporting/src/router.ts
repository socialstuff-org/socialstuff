import {Router}        from 'express';
import reportReasonHandler from './http-handlers/report_reason_handler';
import reportingHandler from './http-handlers/reporting';
const router = Router();
router.use('/report-reasons', reportReasonHandler);
router.use('/report', reportingHandler);
export default router;
