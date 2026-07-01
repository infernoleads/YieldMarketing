// server/src/services/token.js
import jwt from "jsonwebtoken";

function secret() {
  return process.env.JWT_SECRET || "dev-secret-change-me";
}
function expiresIn() {
  return process.env.JWT_EXPIRES_IN || "7d";
}

export function signToken(payload) {
  return jwt.sign(payload, secret(), { expiresIn: expiresIn() });
}

export function verifyToken(token) {
  return jwt.verify(token, secret());
}
