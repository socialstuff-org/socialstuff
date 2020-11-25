
export interface UserReport {
  username_hash: string;
  report_reasons: Array<{
    reason: string,
    times_reported: number
  }>;
}

export const defaultReportReason = (): UserReport => ({
  username_hash: '',
  report_reasons: [],
});

export function createUserReport(username, reportReasons): UserReport {
  return {
    username_hash: username,
    report_reasons: reportReasons
  };
}
