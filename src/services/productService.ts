import { useAppStore } from '../store/useAppStore';
import { Product, Category } from '../types';

export interface IProductService {
  getCategories(): Promise<Category[]>;
  getProducts(categoryId?: string): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  createProduct(product: Omit<Product, 'id'>): Promise<Product>;
  updateProduct(id: string, patch: Partial<Product>): Promise<void>;
  deleteProduct(id: string): Promise<void>;
  toggleAvailability(id: string): Promise<void>;
  togglePopular(id: string): Promise<void>;
  bulkAdjustPrices(percentage: number, appliedBy?: string): Promise<void>;
}

export const ProductService: IProductService = {
  async getCategories() {
    return useAppStore.getState().categories;
  },

  async getProducts(categoryId?: string) {
    const products = useAppStore.getState().products;
    if (categoryId) {
      return products.filter((p) => p.categoryId === categoryId);
    }
    return products;
  },

  async getProductById(id: string) {
    return useAppStore.getState().products.find((p) => p.id === id);
  },

  async createProduct(product) {
    return useAppStore.getState().addProduct(product);
  },

  async updateProduct(id, patch) {
    useAppStore.getState().updateProduct(id, patch);
  },

  async deleteProduct(id) {
    useAppStore.getState().deleteProduct(id);
  },

  async toggleAvailability(id) {
    useAppStore.getState().toggleProductAvailable(id);
  },

  async togglePopular(id) {
    useAppStore.getState().toggleProductPopular(id);
  },

  async bulkAdjustPrices(percentage, appliedBy = 'Administrador') {
    useAppStore.getState().bulkAdjustPrices(percentage, appliedBy);
  },
};
