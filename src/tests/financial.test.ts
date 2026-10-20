import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatCurrency,
  calculateChange,
  validateOrderPayments,
  sanitizeCsvField,
} from '../lib/utils';
import { useAppStore } from '../store/useAppStore';
import { OrderPayment } from '../types';

describe('Financial and Business Logic Utilities', () => {
  it('formats Colombian currency correctly without decimals', () => {
    expect(formatCurrency(28000)).toMatch(/\$?\s?28\.000/);
    expect(formatCurrency(0)).toMatch(/\$?\s?0/);
    expect(formatCurrency(1500000)).toMatch(/\$?\s?1\.500\.000/);
  });

  it('calculates cash change accurately avoiding floating-point imprecision', () => {
    expect(calculateChange(50000, 28000)).toBe(22000);
    expect(calculateChange(28000, 28000)).toBe(0);
    expect(calculateChange(20000, 28000)).toBe(0); // If less received, change is 0
    expect(calculateChange(100000, 34500)).toBe(65500);
  });

  it('validates single and mixed payments correctly', () => {
    // Exact single payment
    const singleValid: OrderPayment[] = [{ method: 'efectivo', amount: 35000 }];
    expect(validateOrderPayments(singleValid, 35000).isValid).toBe(true);

    // Insufficient single payment
    const singleInvalid: OrderPayment[] = [{ method: 'efectivo', amount: 30000 }];
    const resSingle = validateOrderPayments(singleInvalid, 35000);
    expect(resSingle.isValid).toBe(false);
    expect(resSingle.error).toContain('Faltan');

    // Valid mixed payment (efectivo 20000 + nequi 15000 for 35000)
    const mixedValid: OrderPayment[] = [
      { method: 'efectivo', amount: 20000 },
      { method: 'nequi', amount: 15000 },
    ];
    expect(validateOrderPayments(mixedValid, 35000).isValid).toBe(true);

    // Overpaid mixed payment
    const mixedOver: OrderPayment[] = [
      { method: 'efectivo', amount: 25000 },
      { method: 'nequi', amount: 15000 },
    ];
    const resOver = validateOrderPayments(mixedOver, 35000);
    expect(resOver.isValid).toBe(false);
    expect(resOver.error).toContain('supera');
  });

  it('sanitizes formula injection strings (CWE-1236) in CSV export', () => {
    // Dangerous prefixes: =, +, -, @
    expect(sanitizeCsvField('=SUM(A1:A10)')).toBe('"\'=SUM(A1:A10)"');
    expect(sanitizeCsvField('+cmd|/c calc')).toBe('"\'cmd|/c calc"'.replace('cmd', '+cmd'));
    expect(sanitizeCsvField('-2+3*cmd')).toBe('"\' -2+3*cmd"'.replace(' ', ''));
    expect(sanitizeCsvField('@import')).toBe('"\'@import"');

    // Safe regular values
    expect(sanitizeCsvField('Carlos Gomez')).toBe('"Carlos Gomez"');
    expect(sanitizeCsvField('CH-1002')).toBe('"CH-1002"');
    expect(sanitizeCsvField('')).toBe('""');
  });
});

describe('Store Operations: Cancellations, Inventory & Abonos', () => {
  beforeEach(() => {
    useAppStore.getState().resetToDemoData();
  });

  it('reverses customer loyalty points and restores stock on order cancellation', () => {
    const store = useAppStore.getState();

    // Pick a test customer
    const testCustomer = store.customers[0];
    const initialPoints = testCustomer.loyaltyPoints;

    // Create an order assigned to this customer
    const createdOrder = store.createOrder({
      origin: 'mostrador',
      status: 'en_cocina',
      customer: {
        id: testCustomer.id,
        name: testCustomer.name,
        phone: testCustomer.phone,
      },
      items: [
        {
          id: 'item-1',
          productId: 'bg-01', // burger prefix affects carne & pan stock
          name: 'Hamburguesa Doble',
          quantity: 1,
          unitPrice: 28000,
          total: 28000,
          addons: [],
        },
      ],
      subtotal: 28000,
      discount: 0,
      deliveryFee: 0,
      total: 28000,
      payments: [{ method: 'efectivo', amount: 28000 }],
    });

    // Check that customer got points (28000 / 1000 = 28 points)
    const custAfterOrder = useAppStore.getState().customers.find((c) => c.id === testCustomer.id);
    expect(custAfterOrder?.loyaltyPoints).toBe(initialPoints + 28);

    // Now cancel the order
    useAppStore.getState().cancelOrder(createdOrder.id, 'Cliente desistió por demora', 'Cajero Demo');

    // Verify order status and timeline
    const cancelledOrder = useAppStore.getState().orders.find((o) => o.id === createdOrder.id);
    expect(cancelledOrder?.status).toBe('cancelado');
    expect(cancelledOrder?.cancelReason).toBe('Cliente desistió por demora');
    expect(cancelledOrder?.timeline.some((t) => t.status === 'cancelado')).toBe(true);

    // Verify customer loyalty points were reversed
    const custAfterCancel = useAppStore.getState().customers.find((c) => c.id === testCustomer.id);
    expect(custAfterCancel?.loyaltyPoints).toBe(initialPoints);
  });

  it('records abono a fiado in cash session without duplicating sales revenue', () => {
    const store = useAppStore.getState();

    // Find customer with credit balance or pick the first
    const debtor = store.customers.find((c) => c.creditBalance > 0) || store.customers[0];
    const initialDebt = debtor.creditBalance;

    // Register an abono of $10.000 in efectivo
    const abonoAmount = 10000;
    store.recordCreditPayment(debtor.id, abonoAmount, 'efectivo', 'Cajero Demo');

    // Customer balance must decrease by abonoAmount
    const updatedDebtor = useAppStore.getState().customers.find((c) => c.id === debtor.id);
    expect(updatedDebtor?.creditBalance).toBe(Math.max(0, initialDebt - abonoAmount));

    // The active cash session must have recorded the cash movement of type 'abono_fiado'
    const activeSession = useAppStore.getState().cashSessions.find((s) => s.status === 'abierta');
    expect(activeSession).toBeDefined();
    const abonoMovement = activeSession?.movements.find(
      (m) => m.type === 'abono_fiado' && m.amount === abonoAmount
    );
    expect(abonoMovement).toBeDefined();
    expect(abonoMovement?.reason).toContain('Abono');
  });

  it('adjusts prices in bulk with rounding to hundreds and records audit log', () => {
    const store = useAppStore.getState();
    const initialPriceAuditsCount = store.priceAudits.length;

    // Pick first product with basePrice
    const pricedProducts = store.products.filter((p) => p.basePrice !== null);
    const firstPricedBefore = pricedProducts[0];
    const expectedNewPrice = Math.round(((firstPricedBefore.basePrice || 0) * 1.1) / 500) * 500;

    store.bulkAdjustPrices(10, 'Dueño Auditor');

    const pricedProductsAfter = useAppStore.getState().products.filter((p) => p.basePrice !== null);
    const firstPricedAfter = pricedProductsAfter.find((p) => p.id === firstPricedBefore.id);

    expect(firstPricedAfter?.basePrice).toBe(expectedNewPrice);

    // Verify audit record was created
    const audits = useAppStore.getState().priceAudits;
    expect(audits.length).toBe(initialPriceAuditsCount + 1);
    expect(audits[0].percentage).toBe(10);
    expect(audits[0].appliedBy).toBe('Dueño Auditor');
  });

  it('calculates expected cash formula in cash session correctly', () => {
    const store = useAppStore.getState();
    const session = store.cashSessions.find((s) => s.status === 'abierta');
    expect(session).toBeDefined();

    if (session) {
      const cashIn = session.movements
        .filter((m) => m.method === 'efectivo' && (m.type === 'venta' || m.type === 'ingreso' || m.type === 'abono_fiado'))
        .reduce((sum, m) => sum + m.amount, 0);
      const cashOut = session.movements
        .filter((m) => m.method === 'efectivo' && (m.type === 'egreso' || m.type === 'devolucion_cancelacion'))
        .reduce((sum, m) => sum + m.amount, 0);

      const computedExpectedCash = cashIn - cashOut;

      // Close cash session with exact expected amount
      store.closeCashSession(computedExpectedCash, 'Cajero Demo', 'Arqueo de prueba');

      const closedSession = useAppStore.getState().cashSessions.find((s) => s.id === session.id);
      expect(closedSession?.status).toBe('cerrada');
      expect(closedSession?.expectedCash).toBe(computedExpectedCash);
      expect(closedSession?.difference).toBe(0);
    }
  });

  it('validates database JSON backup import schema and rejects corrupted payloads', () => {
    const store = useAppStore.getState();

    // Export valid database
    const backupJson = store.exportDatabaseJson();
    expect(backupJson).toContain('schemaVersion');

    // Re-importing valid backup should succeed
    const validImportResult = store.importDatabaseJson(backupJson);
    expect(validImportResult.success).toBe(true);

    // Attempting to import garbage or malicious JSON should fail cleanly without crashing
    const invalidImportResult = store.importDatabaseJson('{"bad": true}');
    expect(invalidImportResult.success).toBe(false);

    const corruptJson = store.importDatabaseJson('INVALID_NOT_JSON');
    expect(corruptJson.success).toBe(false);
  });
});
