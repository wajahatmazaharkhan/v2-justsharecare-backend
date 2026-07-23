// ===============================================
// Services Layer
// File: Example.services.js
// ===============================================
//
// • This file belongs to the "services" layer of the project.
//   Services contain reusable business logic that is NOT tied
//   directly to routes or controllers.
//
// • Good for external integrations such as:
//     - Nodemailer (email sending)
//     - Cloudinary (image uploads)
//     - Payment gateways (Razorpay, Stripe)
//     - JWT token generation
//     - File processing / utilities
//
// • File name uses PascalCase (Example.services.js)
//   because each service file represents a specific module.
//
// • Controllers should call these services instead of containing
//   the heavy logic inside controller functions.
//
// ===============================================
//
// EXAMPLES:
//
// 1) EmailService.sendMail(data)
// 2) CloudinaryService.uploadImage(file)
// 3) TokenService.generateToken(userId)
// 4) FileService.deleteTempFiles()
//
// ===============================================
