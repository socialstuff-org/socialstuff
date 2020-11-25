export interface ReportSettings {
  report_system: {
    on: boolean,
    automatic_ban: boolean
  }
}

export const defaultSettings = (): ReportSettings => ({
  report_system: {
    on: false,
    automatic_ban: false
  }
});
