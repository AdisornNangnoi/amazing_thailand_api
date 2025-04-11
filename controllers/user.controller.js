//นำเข้า moduule ต่างๆ
const multer = require("multer");
const path = require("path");
const fs = require("fs");

//ใช้ prisma ในการเชื่อมต่อฐานข้อมูล
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//ใช้ cloudinary ในการอัพโหลดรูปภาพ
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configuration
cloudinary.config({
  cloud_name: "dr1f4f8mr",
  api_key: "495799165433341",
  api_secret: "yKnkM6OpT_oQhdvj5PYaob0hnpw", // Click 'View API Keys' above to copy your API secret
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const newFile = "user_" + Math.floor(Math.random() * Date.now()); // The name of the folder in Cloudinary

    return {
      folder: "images/user", // The name of the folder in Cloudinary
      allowed_formats: ["jpg", "png", "jpeg", "gif"], // Allowed formats
      public_id: newFile, // The name of the file in Cloudinary
    };
  },
}); // Correct folder path,

//---------------------------------------------
exports.uploadUser = multer({
  storage: storage,
  limits: {
    fileSize: 1000000, // 1 MB
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb("Error: Images Only!");
  },
}).single("userImage"); // 'userImage' is the name of the file input field in the form
//---------------------------------------------
// Create User

exports.createUser = async (req, res) => {
  try {
    //-----
    const result = await prisma.user_tb.create({
      data: {
        userName: req.body.userName,
        userEmail: req.body.userEmail,
        userPassword: req.body.userPassword,

        userImage: req.file ? req.file.path.replace("images\\user\\", "") : "",
      },
    });
    //-----
    res.status(201).json({
      message: "User created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Check Login for User
exports.checkLogin = async (req, res) => {
  try {
    //-----
    const result = await prisma.user_tb.findFirst({
      where: {
        userEmail: req.params.userEmail,
        userPassword: req.params.userPassword,
      },
    });
    //-----
    if (result) {
      res.status(200).json({
        message: "User login succesfully",
        data: result,
      });
    } else {
      res.status(404).json({
        message: "User login failed",
        data: result,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Edit User
exports.editUser = async (req, res) => {
  try {
    let result = {};
    //---------------------------------------------
    if (req.file) {
      // ค้นดูว่ามีรูปไหม ถ้ามีให้ลบรูปเก่าออกจาก Cloudinary
      const user = await prisma.user_tb.findFirst({
        where: {
          userId: Number(req.params.userId),
        },
      });

      // ตรวจสอบว่ามีรูปไหม
      if (user.userImage) {
        // ลบรูปเก่าออกจาก Cloudinary
        const oldPublicId = user.userImage.split("/").pop().split(".")[0]; // เอา public_id ของรูปเก่า
        await cloudinary.uploader.destroy(
          `images/user/${oldPublicId}`,
          (err, result) => {
            if (err) {
              console.log("Error deleting old image: ", err);
            } else {
              console.log("Old image deleted successfully: ", result);
            }
          }
        );
      }

      // อัปเดตรูปใหม่ใน Cloudinary
      const uploadedImage = req.file.path; // ได้ URL ของไฟล์ใหม่

      result = await prisma.user_tb.update({
        where: {
          userId: Number(req.params.userId),
        },
        data: {
          userName: req.body.userName,
          userEmail: req.body.userEmail,
          userPassword: req.body.userPassword,
          userImage: uploadedImage.replace("images/user/", ""), // อัปเดตรูปใหม่
        },
      });
    } else {
      // แก้ไขข้อมูลผู้ใช้โดยไม่เปลี่ยนรูป
      result = await prisma.user_tb.update({
        where: {
          userId: Number(req.params.userId),
        },
        data: {
          userName: req.body.userName,
          userEmail: req.body.userEmail,
          userPassword: req.body.userPassword,
        },
      });
    }
    //---------------------------------------------
    res.status(200).json({ message: "Edit successfully!", data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
