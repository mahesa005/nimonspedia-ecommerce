// jwtConfig.ts used to configure JWT settings for the application
export const JWT_CONFIG = {
    secret: process.env.JWT_SECRET || "dev-secret", // Get secret from environment variable or use default
    expiresIn: "1h" as const, // Token expiration time
}