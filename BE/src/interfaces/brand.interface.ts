import { BrandStatus } from "@/enums/brand.enum";
export interface IBrand {
  _id: string;
  brand_name: string;
  image_url: string[];
  status: BrandStatus;
}
