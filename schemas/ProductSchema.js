import { model, Schema } from "mongoose";

const ProductSchema = new Schema({
  requestId: { type: String, required: true },
  serialNumber: { type: Number, required: true },
  productName: { type: String, required: true },
  inputImageUrls: [String],
  outputImageUrls: [String],
  status: { 
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  }
});

const Product = model('Product', ProductSchema);
export default Product;