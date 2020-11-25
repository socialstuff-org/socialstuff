export interface ReportReason {
  id: string;
  reason: string;
  max_report_violations: number;
}

export const defaultReportReason = (): ReportReason => ({
  id: '',
  reason: '',
  max_report_violations: 0,
});

export function createReportReason(id, reason, maxViolations): ReportReason {
  return {
    id: id,
    reason: reason,
    max_report_violations: maxViolations,
  };
}
