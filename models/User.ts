import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  username: string;
  password: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default models.User || model<IUser>("User", UserSchema);
