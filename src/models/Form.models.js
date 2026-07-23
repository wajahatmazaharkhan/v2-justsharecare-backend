// ===============================
// Model: Form
// Naming Conventions & Structure
// ===============================
//
// • File name starts with a capital letter (Form.models.js)
//   because model files generally represent a "class-like" entity.
//
// • The model name "Form" uses PascalCase as per Mongoose standards.
//
// • Schema keys follow camelCase for proper JS conventions.
//
// • `.models.js` clearly indicates the file contains a Mongoose model.
//
// • Timestamps enabled for createdAt/updatedAt metadata.

import mongoose from "mongoose";

const formSchema = mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Form = mongoose.model("Form", formSchema);
