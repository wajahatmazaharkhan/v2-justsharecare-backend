export const cacheControl = (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store");
    next();
  } catch (error) {
    console.error("Error setting Cache-Control header:", error);
  }
};
