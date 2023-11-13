import { NextFunction, Response } from "express";
import { verifyToken } from "./encryption";

export async function isAuthenticated(
  req: any,
  res: Response,
  next: NextFunction
) {
  try {
    const tokenFromCookie = req.cookies.token;
    if (!tokenFromCookie) return res.redirect("/login");
    console.log(tokenFromCookie);
    const decryptedToken = verifyToken(tokenFromCookie) as any;
    req.userId = decryptedToken.userId;
    return next();
  } catch (error) {
    return res.redirect("/login");
  }
}
