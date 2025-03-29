import mongoose from "mongoose";

export interface ISubscription extends mongoose.Document {
  name: string;
  billingDate: string;
  type: string;
  amount: number;
}

const SubscriptionSchema = new mongoose.Schema<ISubscription>({
  name: { type: String, required: true },
  billingDate: { type: String, required: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
});

export const Subscription = mongoose.model<ISubscription>(
  "Subscription",
  SubscriptionSchema
);
