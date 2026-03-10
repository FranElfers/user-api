import { Request, Response } from "express";
import { User } from "../models/user";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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

        res.status(201).json(user)
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
      return res.status(404).json({ message: "Usuario no encontrado" });
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
      return res.status(404).json({ message: "Usuario no encontrado" });
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