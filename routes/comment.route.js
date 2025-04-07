const express = require("express");
const router = express.Router();
const commentCtrl = require("../controllers/comment.controller");

// ใช้ multer สำหรับการอัปโหลดข้อมูลจาก form-data
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// เส้นทางสำหรับเพิ่มคอมเมนต์
router.post("/", upload.none(), commentCtrl.createComment); // `none()` สำหรับส่งข้อมูลที่ไม่มีไฟล์

// เส้นทางสำหรับแก้ไขคอมเมนต์
router.put("/:commentId", upload.none(), commentCtrl.editComment);

// เส้นทางสำหรับลบคอมเมนต์
router.delete("/:commentId", commentCtrl.deleteComment);

// เส้นทางสำหรับดึงคอมเมนต์ทั้งหมดตามสถานที่
router.get("/:placeId", commentCtrl.getAllCommentsByPlace);

module.exports = router;
