import { Schema, model } from "mongoose";

export interface IUser {
  name: string;
  cuit: string;
  email: string;
  status: string;
  isAdmin: boolean;
  config: Record<string, any>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true
    },
    cuit: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: "active"
    },
    isAdmin: {
      type: Boolean,
      default: false,
      required: true
    },
    config: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

export const User = model<IUser>("User", UserSchema);