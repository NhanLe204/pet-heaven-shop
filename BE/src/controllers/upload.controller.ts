import { Request, Response } from "express";

interface MulterRequest extends Request {
  file?: any;
  files?: any;
}

export const uploadFile = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    let uploadedFiles: any[] = [];

    if (Array.isArray(req.files)) {
      uploadedFiles = req.files;
    } else if (req.file) {
      uploadedFiles = [req.file];
    } else if (req.files && typeof req.files === "object") {
      Object.values(req.files).forEach((fileGroup: any) => {
        uploadedFiles.push(...fileGroup);
      });
    }

    if (uploadedFiles.length === 0) {
      res.status(400).json({ message: "Không có file nào được tải lên" });
      return;
    }

    // CKEditor chỉ cần 1 ảnh -> trả về url duy nhất
    const file = uploadedFiles[0];
    res.status(200).json({
      url: file.path, // Cloudinary trả về secure_url trong field "path"
    });
  } catch (error) {
    console.error("Lỗi upload file:", error);
    res.status(500).json({ message: "Lỗi khi upload file" });
  }
};
