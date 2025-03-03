import { Router } from "express";
import { addContact, generateMessage, getChat, getChats, getContacts, getUser, getUsers, uploadPicture, userLogin, userLogout, userRegister } from "../controllers/user.controller.js";
import VerifyJwt from "../Middleware/VerifyJwt.js";
import { upload } from "../utils/profileUpload.js";
const router = Router();

router.route("/login").post(userLogin);
router.route("/register").post(userRegister)
router.route("/getUser").get(VerifyJwt,getUser)
router.route("/logout").post(VerifyJwt,userLogout)
router.route("/add-contact").post(VerifyJwt,addContact)
router.route("/getContacts").get(VerifyJwt,getContacts)
router.route("/search").get(getUsers)
router.route("/getChats").get(VerifyJwt,getChats)
router.route("/messages").post(VerifyJwt, getChat)
router.route("/updateProfilePicture").post(VerifyJwt,upload,uploadPicture)
router.route("/genai").get(generateMessage)
export default router;