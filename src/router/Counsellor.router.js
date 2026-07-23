import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";

import { AdminCounsellor, CounsellorController } from "../controllers/index.js";
import { counsellorVerify ,dynamicAuth } from "../middlewares/auth.middlewares.js";

export const counsellorRouter = Router();

counsellorRouter.post(
  "/signup",
  upload.fields([
    { name: "government_id", maxCount: 1 },
    { name: "profile_picture", maxCount: 1 },
    { name: "qualification_certificates", maxCount: 1 },
    { name: "licence", maxCount: 1 },
    { name: "experince_letter", maxCount: 1 },
    { name: "additional_documents", maxCount: 1 },
  ]),
  CounsellorController.CounsellorSignup
);

counsellorRouter.post("/login", CounsellorController.CounsellorLogin);
counsellorRouter.get("/getcounsellor", CounsellorController.getallCounsellor);
counsellorRouter.get(
  "/getrandomcounsellor",
  CounsellorController.getRandomCounsellors
);

counsellorRouter.get("/get-all-counsellors", AdminCounsellor.getAllCounsellors);
counsellorRouter.patch("/approve/:id", AdminCounsellor.approveCounsellor);
counsellorRouter.get(
  "/getcounsellorbyemail/:email",
  CounsellorController.getCounsellorByEmail
);

counsellorRouter.get("/get/:id", CounsellorController.getCounsellorById);

counsellorRouter.put(
  "/update",
  counsellorVerify,
  upload.fields([
    { name: "government_id", maxCount: 1 },
    { name: "profile_picture", maxCount: 1 },
    { name: "qualification_certificates", maxCount: 1 },
    { name: "licence", maxCount: 1 },
    { name: "experince_letter", maxCount: 1 },
    { name: "additional_documents", maxCount: 1 },
  ]),
  CounsellorController.updateCounsellor
);

counsellorRouter.get(
  "/getcounsellorbyslug/:slug",
  CounsellorController.getCounsellorBySlug
);


counsellorRouter.get("/current", counsellorVerify , CounsellorController.getCurrentCounsellor)