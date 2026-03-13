import { Request, Response } from "express";
import { User } from "../models/user";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import jwt from "jsonwebtoken";

export const roleCache = new Map<string, { isAdmin: boolean; expires: number }>(); 

export async function getIsAdminUserById(userId: string): Promise<boolean> {
  const result = await User.findById(userId).select("isAdmin").lean();
  return result?.isAdmin ?? false;
} 

export const getActualUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.actualUserId)

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // save the rol for 5 minutes
    roleCache.set(user.id, {isAdmin: user.isAdmin, expires: Date.now() + 5 * 60 * 1000 });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Error searching User",
      error
    });
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // save the rol for 5 minutes
    roleCache.set(user.id, {isAdmin: user.isAdmin, expires: Date.now() + 5 * 60 * 1000 });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Error searching User",
      error
    });
  }
};

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name, cuit, email, status, config } = req.body;
        const user = new User({
            name,
            cuit,
            email,
            status,
            config
        });

        await user.save();

        res.status(201).json({data: user, token: jwt.sign({sub: user._id.toString()}, process.env.SECRET_API_KEY!)})
    } catch (error) {
        res.status(500).json({
            message: "Error creating user",
            error
        })
    }
}

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
    const { id } = req.params;
    const { name, cuit, email, status, config } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, cuit, email, status, config },
      { new: true, runValidators: true } // new:true devuelve el objeto actualizado
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedUser);

  } catch (error) {
    res.status(500).json({ 
      message: "Error updating user",
      error
    });
  }
}

export const deleteUser = async (req: AuthenticatedRequest, res: Response)  => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `User ${id} deleted successfully`
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting user",
      error
    });
  }
}