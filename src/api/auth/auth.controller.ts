import type { Request, Response } from "express";
import { signupPayloadModel, signinPayloadModel } from "./auth.model.js";
import { User } from "../../mongoose-model/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "./auth.middleware.js";

export interface CustomRequest extends Request {
  user?: {
    userId: string;
  };
}


async function registerUser(req: Request, res: Response) {
  const verifiedData = await signupPayloadModel.safeParseAsync(req.body);
  if (verifiedData.error)
    return res.status(422).json({
      error: verifiedData.error.issues,
      message: "Please enter body fields data correctly",
    });

  const { firstName, lastName, email, password, role } = verifiedData.data;

  const alreadyPresentUser = await User.findOne({ email });

  if (alreadyPresentUser)
    return res.status(500).json({ message: "Email already exists" });

  const cleanLastName =
    lastName && lastName.trim() !== "" ? lastName : undefined;

  try {
    const user = await User.create({
      firstName,
      ...(cleanLastName !== undefined ? { lastName: cleanLastName } : {}),
      email,
      password,
      role: role as any,
    });

    // Send the success response back so the API doesn't hang!
    return res.status(201).json({
      message: "User registered successfully",
      userId: (user as any)._id,
    });
  } catch (dbError: any) {
    // This will catch and print exactly what Mongoose is complaining about
    console.error("Mongoose Save Error: ", dbError);
    return res.status(500).json({
      message: "Database save failed",
      details: dbError.message,
    });
  }
}

async function loginUser(req: Request, res: Response) {
  try {
    const verifiedData = await signinPayloadModel.safeParseAsync(req.body);

    if (verifiedData.error) {
      return res.status(422).json({
        success: false,
        message: "Please enter body field's data correctly",
        error: verifiedData.error.issues,
      });
    }

    const { email, password } = verifiedData.data;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(401).json({
        success: false,
        message: "Email doesn't exists, please Register",
      });

    // @ts-ignore
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user.id);

    const refreshToken = generateRefreshToken(String(user._id));

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Prevents client-side JS access (XSS defense)
      secure: process.env.NODE_ENV === "production", // Only sends over HTTPS in production
      sameSite: "strict", // Protects against CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie lifetime in milliseconds (e.g., 7 days)
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true, // Prevents client-side JS access (XSS defense)
      secure: process.env.NODE_ENV === "production", // Only sends over HTTPS in production
      sameSite: "strict", // Protects against CSRF attacks
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email,
        role: user.role,
        accesstoken: accessToken,
        refreshtoken: refreshToken,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

export async function logoutUser(req:Request, res: Response) { // Fixed: CustomRequest
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Now correctly reads req.user.userId with full TypeScript support!
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.refreshToken = ""; // Alternatively use 'undefined' if schema allows it
    await user.save();

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error: any) {
    console.error("Logout Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getMe(req: Request, res: Response) { // Fixed: CustomRequest
  try { // Added try/catch loop for safety against database dropouts
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(req.user.userId).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error: any) {
    console.error("GetMe Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export { registerUser, loginUser, logoutUser, getMe };
