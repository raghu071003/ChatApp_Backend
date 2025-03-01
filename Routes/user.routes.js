import { Router } from "express";
import { addContact, getChat, getChats, getContacts, getUser, getUsers, userLogin, userLogout, userRegister } from "../controllers/user.controller.js";
import VerifyJwt from "../Middleware/VerifyJwt.js";
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

export default router;