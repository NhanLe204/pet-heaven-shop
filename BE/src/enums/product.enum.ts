export enum ProductStatus {
  AVAILABLE = 'available',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued'
}

export const ProductStatusMapping: Record<string, ProductStatus> = {
  AVAILABLE: ProductStatus.AVAILABLE,
  OUT_OF_STOCK: ProductStatus.OUT_OF_STOCK,
  DISCONTINUED: ProductStatus.DISCONTINUED
};
