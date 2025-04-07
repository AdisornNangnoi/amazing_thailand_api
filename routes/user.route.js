const userCtrl = require("./../controllers/user.controller.js");

const express = require("express");
const router = express.Router();

//Routing is based on RESTful API principles
//GET = ค้นหา ตรวจสอบ ดึง ดู, POST = เพิ่ม, PUT = แก้ไข, DELETE = ลบ
router.post("/", userCtrl.uploadUser, userCtrl.createUser); //create user

router.get("/:userEmail/:userPassword", userCtrl.checkLogin); //check login for user

router.put("/:userId", userCtrl.uploadUser, userCtrl.editUser); //edit user

module.exports = router;
