import mongoose, { Schema, Model, Document } from "mongoose";

export interface ICategories extends Document {
  categoryName: string;
  categorySlug: string;
  categoryImage: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategories>(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      unique: true, // Prevents creating duplicate categories (e.g., two "Electronics")
    },
    categorySlug: {
      type: String,
      unique: true, // ⭐ FIXED: Ensures URL uniqueness (e.g., /categories/mens-wear)
      lowercase: true, // ⭐ FIXED: Forces slugs to stay lowercase for clean URLs
      trim: true,
    },
    categoryImage: {
      type: String,
      required: [true, "Category banner image is required."], // Recommended for storefront layouts
    },
  },
  { timestamps: true },
);

export const Category: Model<ICategories> = mongoose.model<ICategories>(
  "Category",
  categorySchema,
);
