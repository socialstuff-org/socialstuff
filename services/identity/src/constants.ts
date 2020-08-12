import './bootstrap';
export const registrationChallengeMode: 'email' | 'response' = process.env.REGISTRATION_CHALLENGE_MODE as any || 'response';
