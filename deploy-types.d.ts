/**
 * Type declarations to fix deployment errors for sunschool.xyz integration
 */

// Declare loose typing for string/number ID conversions
declare type StringOrNumber = string | number;

// Declare module augmentations to fix Express typing issues
declare namespace Express {
  interface Request {
    user?: any;
  }
}

// Fix for sunschool.xyz domain authentication
declare namespace Auth {
  interface TokenPayload {
    userId: StringOrNumber;
    role: string;
  }
}
