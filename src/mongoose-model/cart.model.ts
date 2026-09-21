import mongoose, { Schema, Model, Document, Types } from "mongoose";
import type { types } from "node:util";

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: [
    {
      productId: Types.ObjectId;
      quantity: number;
    },
  ];
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity cannot be less than 1."], // Pro-tip: Add a minimum validation boundary
          default: 1,
        },
        _id: false, // Stops Mongoose from creating automatic subdocument IDs
      },
    ],
  },
  { timestamps: true },
);

export const Cart: Model<ICart> = mongoose.model<ICart>("Cart", cartSchema);
