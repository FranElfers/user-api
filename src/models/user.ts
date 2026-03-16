import { Schema, model } from "mongoose";

function argentinaNow(): Date {
  const argentinaTime = new Date().toLocaleString("en-US", {
    timeZone: "America/Argentina/Buenos_Aires"
  });

  return new Date(argentinaTime);
}

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
    timestamps: {
      currentTime: argentinaNow
    }
  }
);

export const User = model<IUser>("User", UserSchema);