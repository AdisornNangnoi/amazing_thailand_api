// นำเข้า module ต่างๆ
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// กำหนด storage สำหรับ multer (ใช้ memory storage สำหรับการเก็บข้อมูล)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); // ไม่มีการอัปโหลดไฟล์

// Handle creating a comment
exports.createComment = async (req, res) => {
  try {
    const { placeId, userId, commentText } = req.body;
    if (!placeId || !userId || !commentText) {
      return res
        .status(400)
        .json({ message: "Place ID, User ID, and comment text are required." });
    }

    const result = await prisma.comments_tb.create({
      data: {
        placeId: Number(placeId),
        userId: Number(userId),
        commentText,
      },
    });

    res.status(201).json({
      message: "Comment created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error creating comment: ", error);
    res.status(500).json({ message: "Error: " + error.message });
  }
};

// Handle editing a comment
exports.editComment = async (req, res) => {
  try {
    const { commentText } = req.body;
    const commentId = Number(req.params.commentId);

    // ค้นหาคอมเมนต์ที่ต้องการแก้ไข
    const comment = await prisma.comments_tb.findUnique({
      where: { commentId },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // อัปเดตคอมเมนต์
    const updatedComment = await prisma.comments_tb.update({
      where: { commentId },
      data: {
        commentText,
      },
    });

    res.status(200).json({
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error) {
    console.error("Error updating comment: ", error);
    res.status(500).json({ message: "Error: " + error.message });
  }
};

// Handle deleting a comment
exports.deleteComment = async (req, res) => {
  try {
    const commentId = Number(req.params.commentId);

    // ค้นหาคอมเมนต์ก่อนที่จะลบ
    const comment = await prisma.comments_tb.findUnique({
      where: { commentId },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // ลบคอมเมนต์จากฐานข้อมูล
    const deletedComment = await prisma.comments_tb.delete({
      where: { commentId },
    });

    res.status(200).json({
      message: "Comment deleted successfully",
      data: deletedComment,
    });
  } catch (error) {
    console.error("Error deleting comment: ", error);
    res.status(500).json({ message: "Error: " + error.message });
  }
};

// Handle getting all comments for a place
exports.getAllCommentsByPlace = async (req, res) => {
  try {
    const placeId = Number(req.params.placeId);

    const comments = await prisma.comments_tb.findMany({
      where: { placeId },
      include: {
        user: {
          select: {
            userName: true, // ดึงชื่อผู้คอมเมนต์
            userImage: true, // ดึงรูปภาพของผู้คอมเมนต์
          },
        },
      },
    });

    if (comments.length === 0) {
      return res
        .status(404)
        .json({ message: "No comments found for this place" });
    }

    res.status(200).json({
      message: "Comments found",
      data: comments,
    });
  } catch (error) {
    console.error("Error fetching comments: ", error);
    res.status(500).json({ message: "Error: " + error.message });
  }
};
