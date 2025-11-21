import jwt from "jsonwebtoken";
import "dotenv/config";
import type { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  user?: string | jwt.JwtPayload;
}

export default (req: AuthRequest, res: Response, next: NextFunction) => {
  let token = req.cookies?.token;
  
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  } 
};