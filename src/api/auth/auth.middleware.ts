import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export interface CustomRequest extends Request {
  user?: {
    userId: string;
  };
}


export function generateAccessToken(data: string): string {
  return jwt.sign({ userId: data }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || ("7d" as any),
  });
}

export function generateRefreshToken(data: string): string {
  return jwt.sign({ userId: data }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES || ("7d" as any),
  });
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      userId: string;
    };
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
      userId: string;
    };
  } catch (error) {
    return null;
  }
}


export function authenticationMiddleware() {
  // Use CustomRequest here so we can attach req.user safely
  return function (req: CustomRequest, res: Response, next: NextFunction) {
    const header = req.headers["authorization"];
    if (!header) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!header.startsWith("Bearer ")) {
      return res
        .status(400)
        .json({ error: "Authorization header must start with Bearer" }); // Fixed spelling
    }
    const token = header.split(" ")[1];
    if (!token) {
      return res.status(400).json({
        error: "Authorization header must start with Bearer and followed by token",
      });
    }

    const decodedPayload = verifyAccessToken(token); // decodedPayload is { userId: string } | null
    if (!decodedPayload) {
      return res.status(401).json({ error: "Invalid or expired access token" });
    }

    // Stores { userId: "..." } matching your controller queries!
    req.user = decodedPayload; 

    return next();
  };
}

export function restrictToAuthenticateUser() {
  return function (req: CustomRequest, res: Response, next: NextFunction) {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication Required" });
    }
    return next();
  };
}
