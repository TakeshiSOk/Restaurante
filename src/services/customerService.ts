import { useAppStore } from '../store/useAppStore';
import { Customer, PaymentMethod } from '../types';

export interface ICustomerService {
  getCustomers(): Promise<Customer[]>;
  getCustomerById(id: string): Promise<Customer | undefined>;
  createCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'loyaltyPoints' | 'creditBalance' | 'totalOrders' | 'totalSpent'>): Promise<Customer>;
  updateCustomer(id: string, patch: Partial<Customer>): Promise<void>;
  recordCreditPayment(customerId: string, amount: number, method: PaymentMethod, cashierName?: string): Promise<void>;
  addPoints(customerId: string, points: number): Promise<void>;
}

export const CustomerService: ICustomerService = {
  async getCustomers() {
    return useAppStore.getState().customers;
  },

  async getCustomerById(id: string) {
    return useAppStore.getState().customers.find((c) => c.id === id);
  },

  async createCustomer(data) {
    return useAppStore.getState().addCustomer(data);
  },

  async updateCustomer(id, patch) {
    useAppStore.getState().updateCustomer(id, patch);
  },

  async recordCreditPayment(customerId, amount, method, cashierName) {
    useAppStore.getState().recordCreditPayment(customerId, amount, method, cashierName);
  },

  async addPoints(customerId, points) {
    useAppStore.getState().addLoyaltyPoints(customerId, points);
  },
};
