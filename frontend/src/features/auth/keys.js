export const authKeys = {
  root: ["auth"],
  me: () => ["auth", "me"],
  verifyEmail: (username, token) => ["auth", "verify-email", username, token],
};