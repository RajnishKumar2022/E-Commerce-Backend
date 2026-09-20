import jwt from "jsonwebtoken";

export function generateAccessToken(data: string): string {
    return jwt.sign({ userId: data }, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "7d" as any
    });
}

export function generateRefreshToken(data: string): string {
    return jwt.sign({ userId: data }, process.env.REFRESH_TOKEN_SECRET!, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d" as any
    });
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { userId: string };
  } catch (error) {
    return null; 
  }
}


export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as { userId: string };
  } catch (error) {
    return null; 
  }
}



