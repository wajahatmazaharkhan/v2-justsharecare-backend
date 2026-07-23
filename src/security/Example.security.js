// ===============================================
// Security Layer (End-to-End Security)
// File: Example.services.js
// ===============================================
//
// • This file contains all reusable security-related utilities
//   used across the application.
//
// • Security services ensure that the backend maintains
//   confidentiality, integrity, and safe data handling.
//
// • Common security tasks handled in this layer:
//     1) Password hashing (bcrypt)
//     2) JWT token generation & verification
//     3) Encryption / Decryption utilities (optional)
//     4) Input sanitization (XSS protection)
//     5) Rate-limiting helpers
//     6) Environment variable safety checks
//
// • Controllers should never implement raw hashing or token logic.
//   Instead, they should call these security services to keep the
//   architecture clean, modular, and secure.
//
// ===============================================
//
// EXAMPLES:
//
// 1) HashService.hashPassword(password)
// 2) HashService.comparePassword(input, hashed)
//
// 3) TokenService.generateAccessToken(userId)
// 4) TokenService.verifyAccessToken(token)
//
// 5) CryptoService.encrypt(text)
// 6) CryptoService.decrypt(cipherText)
//
// 7) Sanitizer.clean(inputBody)
//
// ===============================================
