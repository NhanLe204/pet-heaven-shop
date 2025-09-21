import { notification } from "antd";

/**
 * Kiểm tra độ dài chuỗi, nếu vượt quá maxLength thì báo lỗi
 * @param fieldName: tên field để báo lỗi (VD: "Tên danh mục")
 * @param value: giá trị nhập vào
 * @param maxLength: giới hạn ký tự
 * @returns boolean (true = hợp lệ, false = quá dài)
 */
export const validateMaxLength = (
  fieldName: string,
  value: string,
  maxLength: number
): boolean => {
  if (value.length > maxLength) {
    notification.error({
      message: "Lỗi nhập liệu",
      description: `${fieldName} không được vượt quá ${maxLength} ký tự!`,
    });
    return false;
  }
  return true;
};
