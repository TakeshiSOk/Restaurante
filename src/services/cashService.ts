import { useAppStore } from '../store/useAppStore';
import { CashSession, CashMovement } from '../types';

export interface ICashService {
  getCurrentSession(): Promise<CashSession | undefined>;
  getSessionsHistory(): Promise<CashSession[]>;
  openSession(openedBy: string, initialFloat: number): Promise<CashSession>;
  addMovement(movement: Omit<CashMovement, 'id' | 'timestamp'>): Promise<void>;
  closeSession(countedCash: number, closedBy: string, notes?: string): Promise<void>;
}

export const CashService: ICashService = {
  async getCurrentSession() {
    return useAppStore.getState().cashSessions.find((s) => s.status === 'abierta');
  },

  async getSessionsHistory() {
    return useAppStore.getState().cashSessions;
  },

  async openSession(openedBy, initialFloat) {
    return useAppStore.getState().openCashSession(openedBy, initialFloat);
  },

  async addMovement(movement) {
    useAppStore.getState().addCashMovement(movement);
  },

  async closeSession(countedCash, closedBy, notes) {
    useAppStore.getState().closeCashSession(countedCash, closedBy, notes);
  },
};
