const AUTO_USERNAME_RE = /^user\d{3}$/;

export function isAutoUsername(username) {
  return typeof username === "string" && AUTO_USERNAME_RE.test(username);
}