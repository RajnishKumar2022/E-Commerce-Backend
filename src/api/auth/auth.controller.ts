import type { Request, Response } from "express";
import { signupPayloadModel, signinPayloadModel, addToCartPayloadModel } from "./auth.model.js";
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
    return res.status(500).json({
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

// This is my implementation 
// async function addProductToCart(req: Request, res: Response) {
//   // Algorithm to add product to cart
//   //  1. User will press add to cart button then request will come to this route with productId, and I have to fetch userId and using productId fetch all the details of product specially stock of product, and then update cart model with items
//   if (!req.user) {
//     return res.status(401).json({ success: false, message: "Unauthorized" });
//   }

//   const verifiedData = await addToCartPayloadModel.safeParseAsync(req.body)

//   if(!verifiedData.success) return res.status(422).json({error: verifiedData.error.issues, success: false, message: "Please fill correct details"})
  
//     const {productId, quantity } = verifiedData.data

//   // 1. Fixed Query Bug: findById ki jagah findOne use karein kyunki hum userId se search kar rahe hain
//   // 2. Added Populate: .populate() lagane se product ka naam, price, aur images bhi frontend ko mil jayegi
//   const cartDetails = await Cart.findOne({
//     userId: req.user.userId,
//   }).populate({
//     path: "items.productId",
//     select: "productTitle productPrice discountPrice stock images", // Sirf zaroori fields hi fetch karein
//   });

//   if(cartDetails?.items[0].quantity < 0) {

//   }

//   // 3. Fallback Handling: Agar user ka cart database me abhi tak bana hi nahi hai
//   if (cartDetails) {
//     return res.status(200).json({
//       success: true,
//       message: "Cart is empty",
//       cart: { items: [] },
//     });
//   }
// }

// This is generated by AI:

async function addProductToCart(req:Request, res: Response) {
  try {
    // 1. Authorization Check
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { productId, quantity = 1 } = req.body;
    const userId = req.user.userId;

    // Validation: Check if input parameters are provided correctly
    if (!productId || quantity < 1) {
      return res.status(422).json({
        success: false,
        message: "Invalid payload. Product ID and valid quantity are required.",
      });
    }

    // 2. Fetch Product Details & Validate Stock
    const product = await Product.findById(productId);
    
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found or is currently inactive.",
      });
    }

    // Direct check matching your exact product schema key 'stock'
    if (product.stock === 0) {
      return res.status(400).json({
        success: false,
        message: `Sorry, '${product.productTitle}' is currently out of stock.`,
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Cannot add requested quantity. Only ${product.stock} items are available in stock.`,
      });
    }

    // 3. Fetch User's Cart
    let cart = await Cart.findOne({ userId });

    // 4. Array Manipulation Logic based on Cart existence
    if (!cart) {
      // Case A: If Cart does not exist, initialize a new cart with the item
      cart = await Cart.create({
        userId,
        items: [{ productId, quantity }],
      });
    } else {
      // Case B: If Cart already exists, check if the product is already in the items array
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (existingItemIndex > -1) {
        // Sub-Case B1: Product already in cart, calculate combined quantity
        const currentCartQuantity = cart.items[existingItemIndex]!.quantity;
        const projectedQuantity = currentCartQuantity + quantity;

        // Crucial Check: Sum of quantities must not bypass database stock levels
        if (projectedQuantity > product.stock) {
          return res.status(400).json({
            success: false,
            message: `You already have ${currentCartQuantity} of this item in your cart. Adding ${quantity} more would exceed the available stock (${product.stock}).`,
          });
        }

        // Safe to update quantity inside array index map
        cart.items[existingItemIndex]!.quantity = projectedQuantity;
      } else {
        // Sub-Case B2: Product is new for this cart, safely push it
        cart.items.push({ productId, quantity });
      }

      // Save the updated existing cart document
      await cart.save();
    }

    // 5. Populate and Return Final Structure
    // Fetching clean details using your exact Product properties mapping
    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "productTitle productPrice discountPrice stock images",
    });

    return res.status(200).json({
      success: true,
      message: "Product successfully managed in cart.",
      cart: populatedCart,
    });

  } catch (error: any) {
    console.error("AddProductToCart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating your cart data.",
    });
  }
}

// AI Generated 

// async function removeOrDecreaseCartItem(req: Request, res: Response) {
//   try {
//     // 1. Authorization Check
//     if (!req.user ) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     const { productId, action } = req.body; // action can be 'decrease' or 'remove'
//     const userId = req.user.userId;

//     // Validation: Check if input parameters are correct
//     if (!productId || !["decrease", "remove"].includes(action)) {
//       return res.status(422).json({
//         success: false,
//         message: "Invalid payload. Product ID and valid action ('decrease' or 'remove') are required.",
//       });
//     }

//     // 2. Fetch User's Cart
//     const cart = await Cart.findOne({ userId });

//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         message: "Cart not found for this user.",
//       });
//     }

//     // 3. Find the index of the item inside the cart items array
//     const itemIndex = cart.items.findIndex(
//       (item) => item.productId.toString() === productId
//     );

//     // If product is not found in the cart array
//     if (itemIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found inside your cart.",
//       });
//     }

//     // 4. Execution Core Logic based on Action type
//     if (action === "remove") {
//       // Logic to completely remove the item from the array map
//       cart.items.splice(itemIndex, 1);
//     } else if (action === "decrease") {
//       // Logic to decrease quantity by 1
//       const currentQuantity = cart.items[itemIndex].quantity;

//       if (currentQuantity <= 1) {
//         // If current quantity is 1 and user hits decrease, remove it entirely from cart
//         cart.items.splice(itemIndex, 1);
//       } else {
//         // Safe to decrement by 1
//         cart.items[itemIndex].quantity = currentQuantity - 1;
//       }
//     }

//     // 5. Save changes to MongoDB
//     await cart.save();

//     // 6. Return fully populated fresh cart data
//     const populatedCart = await Cart.findById(cart._id).populate({
//       path: "items.productId",
//       select: "productTitle productPrice discountPrice stock images",
//     });

//     return res.status(200).json({
//       success: true,
//       message: `Product successfully ${action === 'remove' ? 'removed' : 'decreased'} in cart.`,
//       cart: populatedCart,
//     });

//   } catch (error: any) {
//     console.error("RemoveOrDecreaseCartItem Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error while updating cart item modifications.",
//     });
//   }
// }



export {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  getAllProducts,
  getProductById,
  getCartData,
  addProductToCart,
  // removeOrDecreaseCartItem
};
