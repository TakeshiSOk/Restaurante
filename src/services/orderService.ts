import { useAppStore } from '../store/useAppStore';
import { Order, OrderStatus } from '../types';

export interface IOrderService {
  getOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  getOrderByCode(code: string): Promise<Order | undefined>;
  createOrder(orderData: Omit<Order, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'timeline'>): Promise<Order>;
  updateStatus(orderId: string, status: OrderStatus, note?: string, driverId?: string, driverName?: string): Promise<void>;
  cancelOrder(orderId: string, reason: string, responsibleName?: string): Promise<void>;
  toggleItemReady(orderId: string, itemId: string): Promise<void>;
  assignDriver(orderId: string, driverId: string, driverName: string): Promise<void>;
}

export const OrderService: IOrderService = {
  async getOrders() {
    return useAppStore.getState().orders;
  },

  async getOrderById(id: string) {
    return useAppStore.getState().orders.find((o) => o.id === id);
  },

  async getOrderByCode(code: string) {
    const cleanCode = code.trim().toUpperCase();
    return useAppStore.getState().orders.find((o) => o.code.toUpperCase() === cleanCode);
  },

  async createOrder(orderData) {
    return useAppStore.getState().createOrder(orderData);
  },

  async updateStatus(orderId, status, note, driverId, driverName) {
    useAppStore.getState().updateOrderStatus(orderId, status, note, driverId, driverName);
  },

  async cancelOrder(orderId, reason, responsibleName) {
    useAppStore.getState().cancelOrder(orderId, reason, responsibleName);
  },

  async toggleItemReady(orderId, itemId) {
    useAppStore.getState().toggleItemReady(orderId, itemId);
  },

  async assignDriver(orderId, driverId, driverName) {
    useAppStore.getState().assignDriver(orderId, driverId, driverName);
  },
};
