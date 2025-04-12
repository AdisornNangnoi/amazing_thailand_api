const multer = require("multer");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const prisma = new PrismaClient();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage configuration for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const newFile = "place_" + Math.floor(Math.random() * Date.now());
    return {
      folder: "images/place",
      allowed_formats: ["jpg", "png", "jpeg", "gif"],
      public_id: newFile,
    };
  },
});

exports.uploadPlace = multer({
  storage: storage,

  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb("Error: Images Only!");
  },
}).single("placeImage"); // 'placeImage' is the name of the input field for the image

// Handle creating a place
// Handle creating a place
exports.createPlace = async (req, res) => {
  try {
    const { placeName, userId } = req.body;
    if (!placeName || !userId) {
      return res
        .status(400)
        .json({ message: "Place name and user ID are required." });
    }

    const placeImage = req.file ? req.file.path : "";

    const result = await prisma.places_tb.create({
      data: {
        placeName,
        userId: Number(userId),
        placeImage,
      },
    });

    res.status(201).json({
      message: "Place created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error creating place: ", error); // เพิ่มการ log ข้อผิดพลาดที่เกิดขึ้น
    res.status(500).json({
      message: "Error: " + error.message,
      stack: error.stack, // แสดงรายละเอียดข้อผิดพลาดที่ละเอียดกว่า
    });
  }
};

// Handle editing a place
exports.editPlace = async (req, res) => {
  try {
    // ค้นหาข้อมูลสถานที่ที่ต้องการแก้ไข
    const place = await prisma.places_tb.findFirst({
      where: { placeId: Number(req.params.placeId) },
    });

    // หากไม่พบสถานที่
    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    // ข้อมูลที่ต้องการอัปเดต
    let updatedData = {
      placeName: req.body.placeName,
      userId: Number(req.body.userId),
    };

    // หากมีการอัปโหลดรูปใหม่
    if (req.file) {
      // ลบรูปเก่าจาก Cloudinary
      if (place.placeImage) {
        const publicId = place.placeImage.split("/").pop().split(".")[0]; // ดึง public_id ของไฟล์เก่า
        await cloudinary.uploader.destroy(
          `images/place/${publicId}`,
          (err, result) => {
            if (err) {
              console.log("Error deleting old image: ", err);
            } else {
              console.log("Old image deleted successfully: ", result);
            }
          }
        );
      }
      // อัปเดตรูปใหม่
      updatedData.placeImage = req.file.path; // กำหนด path ของรูปใหม่
    }

    // อัปเดตข้อมูลสถานที่ในฐานข้อมูล
    const result = await prisma.places_tb.update({
      where: { placeId: Number(req.params.placeId) },
      data: updatedData,
    });

    // ส่งผลลัพธ์กลับไป
    res.status(200).json({
      message: "Place updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating place: ", error); // เพิ่มการ log ข้อผิดพลาด
    res.status(500).json({
      message: "Error: " + error.message,
      errorDetails: error.stack, // แสดงข้อผิดพลาดที่ละเอียด
    });
  }
};
// Handle getting all places
exports.getAllPlaces = async (req, res) => {
  try {
    const places = await prisma.places_tb.findMany(); // ดึงข้อมูลทั้งหมดโดยไม่มีการกรอง
    res.status(200).json({ message: "All places found", data: places });
  } catch (error) {
    console.error("Error fetching places: ", error);
    res.status(500).json({ message: "Error: " + error.message });
  }
};

// Handle getting all places for a user
exports.getAllPlacebyId = async (req, res) => {
  try {
    const places = await prisma.places_tb.findMany({
      where: { userId: Number(req.params.userId) },
    });
    res.status(200).json({ message: "Places found", data: places });
  } catch (error) {
    console.error("Error fetching places: ", error); // เพิ่มการ log ข้อผิดพลาด
    res.status(500).json({ message: "Error: " + error.message });
  }
};

// Handle getting a specific place
exports.getPlace = async (req, res) => {
  try {
    const place = await prisma.places_tb.findUnique({
      where: { placeId: Number(req.params.placeId) },
      include: {
        user: {
          // รวมข้อมูลจากตาราง user_tb
          select: {
            userName: true, // เลือกชื่อผู้โพสต์
            userImage: true, // เลือกรูปภาพของผู้โพสต์
          },
        },
      },
    });

    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    res.status(200).json({
      message: "Place found",
      data: {
        place,
        user: place.user, // ส่งข้อมูลผู้โพสต์ไปพร้อมกับสถานที่
      },
    });
  } catch (error) {
    console.error("Error fetching place: ", error);
    res.status(500).json({ message: "Error: " + error.message });
  }
};

// Handle deleting a place
exports.deletePlace = async (req, res) => {
  try {
    // ค้นหาข้อมูลสถานที่ก่อนลบ
    const place = await prisma.places_tb.findUnique({
      where: { placeId: Number(req.params.placeId) },
    });

    // หากไม่พบสถานที่
    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    // ลบรูปออกจาก Cloudinary (หากมี)
    if (place.placeImage) {
      const publicId = place.placeImage.split("/").pop().split(".")[0]; // ดึง public_id ของไฟล์
      await cloudinary.uploader.destroy(
        `images/place/${publicId}`,
        (err, result) => {
          if (err) {
            console.log("Error deleting image: ", err);
          } else {
            console.log("Image deleted successfully: ", result);
          }
        }
      );
    }

    // ลบข้อมูลสถานที่จากฐานข้อมูล
    const deletedPlace = await prisma.places_tb.delete({
      where: { placeId: Number(req.params.placeId) },
    });

    res.status(200).json({
      message: "Place and image deleted successfully",
      data: deletedPlace,
    });
  } catch (error) {
    console.error("Error deleting place: ", error);
    res.status(500).json({ message: "Error: " + error.message });
  }
};
