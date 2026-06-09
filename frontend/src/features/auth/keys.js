export const authKeys = {
  root: ["auth"],
  me: () => ["auth", "me"],
  profilePage: () => ["auth", "me", "profile-page"],
  verifyEmail: (username, token) => ["auth", "verify-email", username, token],
};
