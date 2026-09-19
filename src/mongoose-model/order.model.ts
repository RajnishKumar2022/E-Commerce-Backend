
import mongoose, { Schema, Model, Document, Types } from 'mongoose'

export enum PaymentStatus {
  Pending = 'pending',
  Processing = 'processing',
  Done = 'done',
  Failed = 'failed'
}

export enum OrderStatus {
  Placed = 'placed',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Cancelled = 'cancelled'
}

interface IShippingAddress {
  addressLine1: string;
  addressLine2?: string; // Made optional as some locations don't have line 2
  pinCode: string;       // Changed to string to preserve leading zeros
  landmark?: string;
  houseNumber?: string;
}

export interface IOrder extends Document {
    buyerId: Types.ObjectId;
    items: {
        productId: Types.ObjectId;
        sellerId: Types.ObjectId;
        quantity: number,
        priceAtPurchase: number
    }[];
    totalAmount: number;
    shippingAddress: IShippingAddress;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
    buyerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            sellerId: {
                type: Schema.Types.ObjectId,
                ref: 'Seller',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Quantity cannot be less than 1.']
            },
            priceAtPurchase: {
                type: Number,
                required: true // ⭐ FIXED: Crucial to enforce so you don't lose accounting data
            },
            _id: false
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative.']
    },
    shippingAddress: {
      addressLine1: { type: String, required: true, trim: true },
      addressLine2: { type: String, trim: true },
      pinCode: { type: String, required: true, trim: true }, // Saved as a string
      landmark: { type: String, trim: true },
      houseNumber: { type: String, trim: true }
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true
    },
    // ⭐ FIXED: Added missing field configurations and connected validators to top Enums
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.Pending
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Placed
    }
},{timestamps: true})


export const Order: Model<IOrder> = mongoose.model<IOrder>('Order', orderSchema) 