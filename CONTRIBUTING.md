
# 🧭 Backend Contribution Guidelines  
### *(Express · Node.js · MongoDB — JavaScript Only, No Frontend References)*

Thank you for contributing to the backend of this project!  
These guidelines ensure consistency, structure, and maintainability across the backend codebase.

This document is **100% backend only** — no frontend terminology, no `App.jsx`, no UI structure.

---

# 📌 1. Workflow & Branching Rules

## Branch Naming Convention

Use descriptive, PascalCase branch names:

### **Features**
```
feature/<PascalCaseFeatureName>
```
Example:
```
feature/UserAuthentication
```

### **Bug Fixes**
```
fix/<PascalCaseBugName>
```
Example:
```
fix/JwtExpiryIssue
```

### **Enhancements / Refactors**
```
enhancement/<PascalCaseImprovement>
refactor/<PascalCaseRefactor>
```

### General Rules
- ❌ Never push directly to `main`.
- ✔️ Create branches only from `develop` (or designated development branch).
- ✔️ Commit frequently with meaningful commit messages:
  - `feat: add login route`
  - `fix: correct password hashing bug`
  - `refactor: cleanup user service`
- ✔️ PRs must be reviewed before merge.
- ✔️ Code must pass linting & tests before PR submission.

---

# 📁 2. Backend Folder Structure

Recommended directory layout for Express + MongoDB:

```
src/
  app.js               # Express app setup
  server.js            # Server bootstrap (listen)

  config/
    index.js           # Centralized configuration loader

  db/
    index.js           # MongoDB connection
    migrations/
    seeds/

  api/
    routes/
      userRoutes.js
      index.js
    controllers/
      userController.js
    validators/
      userValidator.js

  models/
    User.js

  services/
    userService.js

  middlewares/
    authMiddleware.js
    errorMiddleware.js

  utils/
    logger.js
    asyncHandler.js

  jobs/
    cronJobs.js

test/
  user.test.js
```

---

# 🧱 3. Backend Responsibilities & Separation of Concerns

### **Controllers**
- Parse request body/params.
- Call service methods.
- Return HTTP responses.
- Contain *no business logic*.

### **Services**
- Business logic lives here.
- Talk to models.
- Maintain reusable domain logic.

### **Models**
- Mongoose schemas or MongoDB data interaction.
- Database structure only.

### **Routes**
- Attach validators, middlewares, and controllers.

### **Middlewares**
- Authentication
- Validation
- Error handling
- Logging
- Rate limiting

### **Utils**
- Pure helper functions only.

---

# 🔐 4. Security Guidelines

- Keep secrets in `.env`, never commit them.
- Provide `.env.example` to document variables.
- Validate all incoming data with:
  - `joi`
  - `express-validator`
  - or custom schema validators
- Use:
  - `helmet` for security headers
  - `cors` with proper domain restrictions
  - rate limiting middleware
- Never log sensitive data (passwords, tokens).
- Hash passwords using `bcrypt`.

---

# 🗄️ 5. MongoDB / Mongoose Best Practices

- Keep models simple and descriptive.
- Use indexes where needed.
- Avoid unbounded subdocuments — consider referencing.
- Use migrations when modifying structures.
- Use `lean()` for readonly queries.
- Validate schema strictly.

Example model:

```js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
```

---

# 🧪 6. Testing Standards

Use **Jest** + **Supertest**.

### Required test types:
- Unit tests for services
- Integration tests for routes
- DB tests with `mongodb-memory-server` where possible

### Testing Rules
- Tests must be deterministic.
- Tests must clean up after themselves.
- Coverage should include core logic.

---

# 🧾 7. Error Handling

Use a centralized error middleware.

### Rules:
- Throw `Error` objects or custom error classes only.
- Do not expose stack traces in production.
- Use `asyncHandler` for routes.

Example:

```js
module.exports = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

---

# 📜 8. Logging Standards

- Use a dedicated logger (`winston`, `pino`, etc.).
- Use levels: `info`, `warn`, `error`, `debug`.
- Avoid console logs in production code.
- Never log passwords, tokens, PII.

---

# ♻️ 9. API Versioning

Use versioned routes:

```
/api/v1/users
/api/v1/auth/login
```

Breaking changes require a **new version**, not silent modification.

---

# 📦 10. Environment Management

- Keep all config in `config/index.js`.
- Never access `process.env` directly throughout the codebase — read through config loader.
- Example:

```js
module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
};
```

---

# 📋 11. Pull Request Checklist

Before opening a PR:

- [ ] Branch follows naming rules  
- [ ] Lint passes  
- [ ] Tests updated + passing  
- [ ] No console.logs left in code  
- [ ] No sensitive files included  
- [ ] DB changes include migrations/seeds  
- [ ] Documentation updated if necessary  

---

# 🔁 12. Code Review Expectations

Reviewers will check:

- Code readability & clarity  
- Proper use of controllers/services/models  
- Error handling correctness  
- Security hygiene  
- Validation completeness  
- Maintainability & future flexibility  

---

# 🙌 Thank You

Your contributions improve the backend’s structure, maintainability, and scalability.
