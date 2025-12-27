// types/express.d.ts
// Extend Express Request type to include authenticated user

import { JwtPayload } from '../utils/jwt.util';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
