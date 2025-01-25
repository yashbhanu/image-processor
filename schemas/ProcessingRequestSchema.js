import { Schema, model } from 'mongoose';

const ProcessingRequestSchema = new Schema({
    requestId: { type: String, required: true, unique: true },
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    createdAt: { type: Date, default: Date.now },
    webhookUrl: { type: String },
    totalImages: { type: Number, default: 0 },
    processedImages: { type: Number, default: 0 }
  });

const ProcessingRequest = model('ProcessingRequest', ProcessingRequestSchema);
export default ProcessingRequest;