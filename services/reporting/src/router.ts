import {Router}        from 'express';
import reportReasonHandler from './http-handlers/report_reason_handler';

const router = Router();
router.use('/report-reasons', reportReasonHandler);

export default router;
