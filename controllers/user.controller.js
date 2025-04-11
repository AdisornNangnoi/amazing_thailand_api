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
    const result = await prisma.user_tb.findFirst({
      where: {
        userEmail: req.params.userEmail,
        userPassword: req.params.userPassword,
      },
    });

    if (result) {
      res.status(200).json({
        message: "User login successfully",
        data: result,
      });
    } else {
      res.status(401).json({
        message: "Invalid email or password",
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

    // ตรวจสอบว่ามีไฟล์ใหม่หรือไม่
    if (req.file) {
      // ค้นหาผู้ใช้ในฐานข้อมูล
      const user = await prisma.user_tb.findFirst({
        where: {
          userId: Number(req.params.userId),
        },
      });

      // ตรวจสอบว่ามีรูปเก่าอยู่ในฐานข้อมูลหรือไม่
      if (user && user.userImage) {
        const oldPublicId = user.userImage.split("/").pop().split(".")[0]; // เอา public_id ของรูปเก่า

        if (oldPublicId) {
          try {
            // ลบรูปเก่าออกจาก Cloudinary
            await cloudinary.uploader.destroy(`images/user/${oldPublicId}`);
            console.log("Old image deleted successfully");
          } catch (err) {
            console.log("Error deleting old image: ", err);
            return res.status(500).json({
              message: "Error deleting old image from Cloudinary",
            });
          }
        }
      }

      // อัปโหลดรูปใหม่ใน Cloudinary
      const uploadedImage = req.file.path
        .replace("images\\user\\", "") // แก้ไข path ที่จะถูกแทนที่
        .replace("\\", "/");

      // อัปเดตข้อมูลผู้ใช้ในฐานข้อมูล
      result = await prisma.user_tb.update({
        where: {
          userId: Number(req.params.userId),
        },
        data: {
          userName: req.body.userName,
          userEmail: req.body.userEmail,
          userPassword: req.body.userPassword,
          userImage: uploadedImage, // อัปเดตรูปใหม่
        },
      });
    } else {
      // หากไม่มีไฟล์ใหม่, อัปเดตข้อมูลผู้ใช้โดยไม่เปลี่ยนรูป
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

    res.status(200).json({ message: "Edit successfully!", data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
