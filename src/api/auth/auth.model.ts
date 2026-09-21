import { z } from "zod"

export const signupPayloadModel = z.object({
    firstName: z.string().min(3).max(50),
    lastName: z.string().min(3).max(30).optional(),
    email: z.email(),
    password: z.string().min(6).max(66),
    role: z.enum(['admin', 'customer', 'seller']).default('customer')
})


export const signinPayloadModel = z.object({
    email: z.email(),
    password: z.string().min(6).max(66)
})

export const addToCartPayloadModel = z.object({
    quantity: z.number().max(5).min(1).default(1),
    productId: z.string()
})


// AI generated

// 1. Reusable Nesting Schema for Structured Shipping Address
const shippingAddressSchema = z.object({
  addressLine1: z.string().min(5, "Address Line 1 is too short").max(100).trim(),
  addressLine2: z.string().max(100).trim().optional(),
  // Kept as string to preserve leading zeros (e.g., 00123)
  pinCode: z.string().min(4, "Invalid Pin Code").max(10, "Pin Code too long").trim(),
  landmark: z.string().max(50).trim().optional(),
  houseNumber: z.string().max(20).trim().optional(),
});

// 2. Main Order Placement Payload Schema
export const placeOrderPayloadModel = z.object({
  // Accept arrays of items matching your dynamic cart structure
  items: z.array(
    z.object({
      productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product MongoDB ID format"),
      sellerId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Seller MongoDB ID format"),
      quantity: z.number().int().min(1, "Quantity must be at least 1"),
    })
  ).min(1, "Order must contain at least one item"),

  // Mapped object validator replacing the old raw string structure
  shippingAddress: shippingAddressSchema,

  // Accept specific payment processors/methods (e.g., 'cod', 'stripe', 'upi')
  paymentMethod: z.string().min(2, "Please select a payment method").trim().lowercase(),
});

// Extract TypeScript type from the Zod Schema definitions
export type PlaceOrderPayload = z.infer<typeof placeOrderPayloadModel>;
