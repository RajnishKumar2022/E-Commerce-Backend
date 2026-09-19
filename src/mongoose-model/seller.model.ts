import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface ISeller extends Document {
  role: string;
  userId: Types.ObjectId;
  gstNo: string;
  shopName: string;
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
  }[];
  isVerifiedByAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sellerSchema = new Schema<ISeller>(
  {
    role: {
      type: String,
      required: true,
      default: "seller",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // Recommended: A seller profile must link to an account user
      unique: true, // Prevents a single user account from creating duplicate seller profiles
    },
    gstNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true, // Forces GSTIN to uppercase natively
      // ⭐ FIXED: Formatted Regex for Indian GSTIN patterns
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Please provide a valid Indian GSTIN number.",
      ],
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    bankDetails: [
      {
        accountHolderName: {
          type: String,
          required: true,
          trim: true,
        },
        accountNumber: {
          type: String, // ⭐ FIXED: Stored safely as a string
          required: true,
          trim: true,
          match: [
            /^\d{9,18}$/,
            "Please enter a valid bank account number (9-18 digits).",
          ],
        },
        ifscCode: {
          type: String,
          required: true,
          trim: true,
          uppercase: true, // Safely formats input like 'sbin0001234' to uppercase
          // ⭐ FIXED: Standard regex for Indian IFSC Codes
          match: [
            /^[A-Z]{4}0[A-Z0-9]{6}$/,
            "Please provide a valid 11-digit IFSC code.",
          ],
        },
        _id: false,
      },
    ],
    isVerifiedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Seller: Model<ISeller> = mongoose.model<ISeller>(
  "Seller",
  sellerSchema,
);
