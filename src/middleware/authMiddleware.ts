import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export interface AuthenticatedRequest extends Request {
	userId?: string;
	
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