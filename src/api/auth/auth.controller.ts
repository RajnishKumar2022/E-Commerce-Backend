import type { Request, Response } from "express";
import { signupPayloadModel, signinPayloadModel } from "./auth.model.js";
import { User } from "../../mongoose-model/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "./auth.middleware.js";
import { Product } from "../../mongoose-model/product.model.js";
import { Cart } from "../../mongoose-model/cart.model.js";

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

async function logoutUser(req: Request, res: Response) {
  // Fixed: CustomRequest
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Now correctly reads req.user.userId with full TypeScript support!
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
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

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error: any) {
    console.error("Logout Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

async function getMe(req: Request, res: Response) {
  // Fixed: CustomRequest
  try {
    // Added try/catch loop for safety against database dropouts
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(req.user.userId).select(
      "-password -refreshToken",
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error: any) {
    console.error("GetMe Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

// Get all products

async function getAllProducts(req: Request, res: Response) {
  try {
    const products = await Product.find({})
      .populate("sellerId") // Replaces ID with full Seller object
      .populate("categoryId"); // Replaces ID with full Category object

    return res.status(200).json({
      success: true,
      message: "Successfully fetched all the products",
      products,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error while fetching Products.",
      });
  }
}

// Below the code is AI Generated:-

// 1. Define or import interfaces for your referenced models
// interface ISeller {
//   _id: string;
//   name: string; // Add your actual Seller fields here
//   email: string;
// }

// interface ICategory {
//   _id: string;
//   categoryName: string; // Add your actual Category fields here
// }

// export async function getAllProducts(req: Request, res: Response): Promise<Response> {
//   try {
//     // 2. Fetch and strictly type the populated properties
//     const products = await Product.find({})
//       .populate<{ sellerId: ISeller }>('sellerId')
//       .populate<{ categoryId: ICategory }>('categoryId')
//       .lean(); // 3. Recommmended: use .lean() for faster, read-only performance

//     return res.status(200).json({
//       success: true,
//       message: "Successfully fetched all the products",
//       products
//     });

//   } catch (error) {
//     console.error("Error fetching products:", error); // console.error is better practice for errors
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error while fetching Products."
//     });
//   }
// }

// Below the code is written by me
// async function getProductById(req: Request, res: Response) {
//   try {
//     const { id } = req.params.id
//     const product = await Product.findById({id}).populate('sellerId').populate('categoryId')
//     if(!product) return res.status().json({})

//     return res.status(200).json({success: true, message: `Successfully fetched product by given ${id}`, product})
//   } catch (error) {
//     console.log(error);

//   }
// }

// The code which is below is written by AI
async function getProductById(req: Request, res: Response) {
  try {
    // 1. Fixed destructuring mismatch (req.params se id nikalna)
    const { id } = req.params;

    // 2. Fixed query format: findById directly expects the raw string/ID, not an object
    const product = await Product.findById(id)
      .populate("sellerId", "firstName lastName email") // Optional: Only fetch safe fields
      .populate("categoryId", "categoryName slug");

    // 3. Fixed Express crash: status() requires an HTTP code (404)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: `Successfully fetched product by given id: ${id}`,
      product,
    });
  } catch (error: any) {
    // 4. Fixed: Catch block must handle errors and return a response to client
    console.error("GetProductById Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error or invalid product ID format",
    });
  }
}

// Below is my implementation
// async function getCartData(req:Request, res: Response){
//   try {
//     if (!req.user) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     const user = await User.findById(req.user.userId).select(
//       "-password -refreshToken",
//     );

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     const cartDetails = await Cart.findById(user._id);

//   } catch (error) {
//     console.log(error);

//   }
// }

// And this one is AI generated

async function getCartData(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 1. Fixed Query Bug: findById ki jagah findOne use karein kyunki hum userId se search kar rahe hain
    // 2. Added Populate: .populate() lagane se product ka naam, price, aur images bhi frontend ko mil jayegi
    const cartDetails = await Cart.findOne({
      userId: req.user.userId,
    }).populate({
      path: "items.productId",
      select: "productTitle productPrice discountPrice stock images", // Sirf zaroori fields hi fetch karein
    });

    // 3. Fallback Handling: Agar user ka cart database me abhi tak bana hi nahi hai
    if (!cartDetails) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        cart: { items: [] },
      });
    }

    // Success response returning fully populated cart details
    return res.status(200).json({
      success: true,
      message: "Cart details fetched successfully",
      cart: cartDetails,
    });
  } catch (error: any) {
    // 4. Fixed: Catch block me response return karna zaroori hai taaki request hang na ho
    console.error("GetCartData Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching cart details",
    });
  }
}

export {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  getAllProducts,
  getProductById,
  getCartData,
};
