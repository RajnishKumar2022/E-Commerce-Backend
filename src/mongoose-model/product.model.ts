import mongoose, { Schema, Model, Document, Types } from "mongoose"


export interface IProduct extends Document {
    sellerId: Types.ObjectId,
    categoryId: Types.ObjectId,
    productTitle: string,
    productDescription: string,
    productPrice: number,
    discountPrice?: number,
    stock: number,
    images: { imageURL : string}[];
    isActive: boolean;
    createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
    sellerId: {
        type: Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    productTitle: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
        lowercase: true
    },
    productDescription: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 100,
        lowercase: true
    },
    productPrice: {
        type: Number,
        required: true,
    },
    discountPrice: {
        type: Number,
    },
    stock: {
        type: Number,
        min: [0, "stock can't be less than zero"],
        default: 0,
        required: true
    },
    images: [
        {
            imageURL: {
                type: String,
                required: true
            },
            _id: false
        },
    ],
    isActive: {
        type: Boolean,
        default: true
    }

},{timestamps: true})

export const Product: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema)