import mongoose, { Schema, Document, models } from "mongoose";

export interface INotification extends Document {
  userId: string; // reference to User _id
  title: string;
  body?: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  body: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
