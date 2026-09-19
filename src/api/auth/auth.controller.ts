import type { Request, Response } from "express";
import { signupPayloadModel } from "./auth.model.js";
import { User } from "../../mongoose-model/user.model.js";

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
