import React from 'react';
import { Order } from '../../types';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

interface ThermalReceiptProps {
  order: Order;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ order }) => {
  const settings = useAppStore((s) => s.settings);

  return (
    <div id="thermal-receipt" className="text-black bg-white p-3 font-mono text-xs w-[80mm] mx-auto leading-tight">
      <div className="text-center pb-2 border-b border-dashed border-black">
        <h1 className="font-bold text-base tracking-wider uppercase">{settings.name}</h1>
        <p className="text-[10px] uppercase">{settings.tagline}</p>
        <p className="text-[10px] mt-1 whitespace-pre-line">{settings.printTicketHeader}</p>
        <p className="text-[10px]">{settings.address}</p>
        <p className="text-[10px]">Tel / WhatsApp: {settings.phone}</p>
      </div>

      <div className="py-2 border-b border-dashed border-black text-[11px]">
        <div className="flex justify-between">
          <span className="font-bold">PEDIDO: {order.code}</span>
          <span className="uppercase font-semibold">[{order.origin}]</span>
        </div>
        <div>FECHA: {formatDateTime(order.createdAt)}</div>
        <div>CLIENTE: {order.customer.name}</div>
        {order.customer.phone && <div>TEL: {order.customer.phone}</div>}
        {order.customer.tableNumber && <div>MESA: #{order.customer.tableNumber}</div>}
        {order.customer.address && <div>DIR: {order.customer.address}</div>}
        {order.cashierName && <div>ATIENDE: {order.cashierName}</div>}
      </div>

      <div className="py-2 border-b border-dashed border-black">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-black text-left">
              <th className="w-8">CANT</th>
              <th>DESCRIPCIÓN</th>
              <th className="text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <React.Fragment key={idx}>
                <tr>
                  <td className="align-top font-bold">{item.quantity}</td>
                  <td className="align-top">
                    <span className="font-semibold">{item.name}</span>
                    {item.variantName && <div className="text-[10px] italic">({item.variantName})</div>}
                    {item.addons && item.addons.length > 0 && (
                      <div className="text-[9px] text-zinc-700">
                        {item.addons.map((a) => `+ ${a.name}`).join(', ')}
                      </div>
                    )}
                    {item.notes && <div className="text-[9px] italic text-zinc-600">Nota: {item.notes}</div>}
                  </td>
                  <td className="align-top text-right font-medium">{formatCurrency(item.total)}</td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="py-2 border-b border-dashed border-black text-[11px] space-y-1">
        <div className="flex justify-between">
          <span>SUBTOTAL:</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between font-semibold">
            <span>DESCUENTO:</span>
            <span>-{formatCurrency(order.discount)}</span>
          </div>
        )}
        {order.deliveryFee > 0 && (
          <div className="flex justify-between">
            <span>DOMICILIO:</span>
            <span>{formatCurrency(order.deliveryFee)}</span>
          </div>
        )}
        {order.tip && order.tip > 0 ? (
          <div className="flex justify-between">
            <span>PROPINA VOLUNTARIA:</span>
            <span>{formatCurrency(order.tip)}</span>
          </div>
        ) : null}
        <div className="flex justify-between text-sm font-bold pt-1 border-t border-black">
          <span>TOTAL A PAGAR:</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      <div className="py-2 border-b border-dashed border-black text-[10px]">
        <div className="font-bold">MÉTODOS DE PAGO:</div>
        {order.payments.map((p, idx) => (
          <div key={idx} className="flex justify-between">
            <span className="uppercase">{p.method}:</span>
            <span>{formatCurrency(p.amount)}</span>
          </div>
        ))}
        {order.payments[0]?.receivedAmount && order.payments[0].method === 'efectivo' && (
          <>
            <div className="flex justify-between">
              <span>EFECTIVO RECIBIDO:</span>
              <span>{formatCurrency(order.payments[0].receivedAmount)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>CAMBIO / VUELTO:</span>
              <span>{formatCurrency(order.payments[0].change ?? 0)}</span>
            </div>
          </>
        )}
      </div>

      <div className="pt-3 text-center text-[10px] space-y-1">
        <p className="whitespace-pre-line">{settings.printTicketFooter}</p>
        <p className="text-[8px] text-zinc-600 mt-2">
          Control interno de ventas y caja. No sustituye factura electrónica.
        </p>
      </div>
    </div>
  );
};
