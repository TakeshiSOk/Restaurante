import { useAppStore } from '../store/useAppStore';
import { InventoryItem } from '../types';

export interface IInventoryService {
  getItems(): Promise<InventoryItem[]>;
  getLowStockItems(): Promise<InventoryItem[]>;
  adjustStock(id: string, delta: number): Promise<void>;
  updateItem(id: string, patch: Partial<InventoryItem>): Promise<void>;
}

export const InventoryService: IInventoryService = {
  async getItems() {
    return useAppStore.getState().inventory;
  },

  async getLowStockItems() {
    return useAppStore.getState().inventory.filter((item) => item.stock <= item.minStock);
  },

  async adjustStock(id, delta) {
    useAppStore.getState().adjustInventoryStock(id, delta);
  },

  async updateItem(id, patch) {
    useAppStore.getState().updateInventoryItem(id, patch);
  },
};
