import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export function hashPassword(plainPassword: string) {
  return bcrypt.hash(plainPassword, 10);
}

export function comparePassword(plainPassword: string, hashedPassword: string) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export function createJwtToken(userId: number) {
  return jwt.sign({ userId }, "supersecret");
}

export function verifyToken(token: string) {
  return jwt.verify(token, "supersecret");
}
