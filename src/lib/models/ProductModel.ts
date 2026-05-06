import mongoose from 'mongoose'

export type Product = {
  _id: string
  name: string
  price: number
  description?: string
  stock: number
  image?: string
}

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },    
    image: { type: String },
  },
  { timestamps: true }
)

const ProductModel = mongoose.models?.Product || mongoose.model('Product', ProductSchema)

export default ProductModel
