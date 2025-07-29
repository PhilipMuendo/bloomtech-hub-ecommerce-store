import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  content: { type: String, required: true },
  sentDate: { type: Date, default: Date.now },
  recipients: [{ type: String, required: true }],
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign; 