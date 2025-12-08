-- Update admin password to 'admin123' with Node.js bcrypt compatible hash
UPDATE "user" 
SET password = '$2b$10$px.NTnN/uCQFtOraROp/4uDmwwjejpJPrR.2LlxNctJkQZacTiLre' 
WHERE email = 'luthor@lexcorp.com';

-- Verify update
SELECT user_id, email, role, substring(password, 1, 30) as password_preview 
FROM "user" 
WHERE email = 'luthor@lexcorp.com';
