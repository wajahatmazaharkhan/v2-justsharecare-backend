// ===============================================
// Middleware: Auth Example
// File: Example.middlewares.js
// ===============================================
//
// • This is a small demo middleware showing how
//   authentication middlewares work in Express.
//
// • Middlewares run BEFORE the controller.
// • Use them to check if user is logged in.
//
// ===============================================


// ----------------------------------------------------
// Basic Auth Middleware Example
// ----------------------------------------------------
export const AuthMiddleware = (req, res, next) => {
    const token = req.headers.authorization;

    // If no token → block request
    if (!token) {
        return res.status(401).json({ msg: "Access denied: No token provided" });
    }

    // Simple demo validation (you can replace this logic)
    if (token !== "my-secret-token") {
        return res.status(403).json({ msg: "Invalid token" });
    }

    // If token is valid → go ahead
    next();
};


// ----------------------------------------------------
// Example Usage inside Router (for learning purpose)
// ----------------------------------------------------
// FormRouter.post("/submit", AuthMiddleware, FormController);
//
// UserRouter.get("/profile", AuthMiddleware, ProfileController);
//
// ProductRouter.delete("/:id", AuthMiddleware, DeleteProductController);
// ----------------------------------------------------
