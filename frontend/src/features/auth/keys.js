export const authKeys = {
  root: ["auth"],
  me: () => ["auth", "me"],
  profileMe: () => ["auth", "profile", "me"],
};