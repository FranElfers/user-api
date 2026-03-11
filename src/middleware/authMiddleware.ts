import { Request, Response, NextFunction } from "express";
import { roleCache, getIsAdminUserById } from "../queries/userQueries";
import jwt from "jsonwebtoken";


export interface AuthenticatedRequest extends Request {
	userId?: string;
}

export async function authorizeAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "User not autenticated" });

  const cached = roleCache.get(userId);
  const now = Date.now();

  if (cached && cached.expires > now) {
    if (!cached.isAdmin) {
      return res.status(403).json({ message: "Administrator-only access" });
    }
    return next();
  }

  // si no hay cache o expiró, consultar DB
  try {
    const isAdmin = await getIsAdminUserById(userId);

    roleCache.set(userId, { isAdmin: isAdmin, expires: now + 5 * 60 * 1000 });

    if (!isAdmin) {
      return res.status(403).json({ message: "Administrator-only access" });
    }
    next();
  } catch {
    res.status(500).json({ message: "Internal error" });
  }
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
	const authHeader = req.headers["authorization"];
	
	if (!authHeader) {
		return res.status(401).json({
			message: "Token required"
		});
	}

	const token = authHeader.split(" ")[1];

	try {
    const decodedToken = jwt.verify(token, process.env.SECRET_API_KEY!) as {
      sub: string;
    };

    req.userId = decodedToken.sub;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid Token" });
  }
}