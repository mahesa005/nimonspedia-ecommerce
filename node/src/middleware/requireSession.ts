import { Request, Response, NextFunction } from 'express';
import { Socket } from 'socket.io';
import { parse } from "cookie";

const PHP_AUTH_URL = 'http://nginx:80/api/auth/validate-session';

// Helper: Calls PHP to validate the Session ID
const validateWithPHP = async (sessionId: string) => {
  try {
    const response = await fetch(PHP_AUTH_URL, {
      method: 'GET',
      headers: {
        'Cookie': `PHPSESSID=${sessionId}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data: any = await response.json();

    if (data && data.valid) {
      return data.user;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Express Middleware (For REST API)
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookies = parse(req.headers.cookie || '');
    const sessionId = cookies.PHPSESSID;

    if (!sessionId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await validateWithPHP(sessionId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Socket.io Middleware
export const requireSocketAuth = async (socket: Socket, next: (err?: any) => void) => {
  try {
    const cookies = parse(socket.request.headers.cookie || "");
    const sessionId = cookies.PHPSESSID;

    if (!sessionId) {
      return next(new Error("Authentication error: No session found"));
    }

    const user = await validateWithPHP(sessionId);

    if (!user) {
      return next(new Error("Authentication error: Invalid session"));
    }

    socket.data.user = user;
    next();
  } catch (error) {
    console.log("SOCKET AUTH — ERROR:", error);
    next(new Error("Authentication check failed"));
  }
};
