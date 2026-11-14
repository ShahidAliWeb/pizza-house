import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';
import { Order } from '../types';

interface OrderInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Action Header (Hidden during print) */}
        <div className="px-6 py-4 bg-stone-100 border-b border-stone-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-stone-800">Commercial Tax Invoice / Receipt</h3>
            <span className="text-xs font-mono text-stone-500">#{order.orderNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div id="printable-invoice" className="p-8 bg-white text-stone-800">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-stone-200 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <img
                  src="/assets/aistudio/pizz_logo_a5bbf288.jpg"
                  alt="Pizza House Logo"
                  className="w-10 h-10 rounded-lg object-cover border border-stone-300"
                />
                <span className="text-2xl font-extrabold text-stone-900 tracking-tight">Pizza House</span>
              </div>
              <p className="text-xs text-stone-500">Artisan Wood-Fired & Pakistani Fusion Pizzas</p>
              <p className="text-xs text-stone-500 mt-1">Helpline: +92 300 1234567 · info@pizzahouse.pk</p>
              <p className="text-[11px] text-stone-400 font-mono mt-0.5">STRN: 3277876123456 · NTN: 8492011-3</p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-stone-100 text-stone-800 rounded font-bold text-xs uppercase tracking-wider mb-1">
                Tax Invoice
              </span>
              <p className="text-base font-extrabold text-stone-900 font-mono">{order.orderNumber}</p>
              <p className="text-xs text-stone-500">
                Date: {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs font-semibold text-amber-700 mt-1">
                Status: {order.orderStatus.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="grid grid-cols-2 gap-6 pb-6 mb-6 border-b border-stone-200 text-xs">
            <div>
              <h4 className="font-bold text-stone-900 uppercase tracking-wider mb-1 text-[11px] text-stone-500">
                Billed To (Customer):
              </h4>
              <p className="font-bold text-stone-900 text-sm">{order.customerName}</p>
              <p className="text-stone-600 font-mono mt-0.5">{order.customerPhone}</p>
              <p className="text-stone-600">{order.customerEmail}</p>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 uppercase tracking-wider mb-1 text-[11px] text-stone-500">
                Delivery Address:
              </h4>
              <p className="text-stone-900 font-medium">{order.deliveryAddress.houseNumber}, {order.deliveryAddress.street}</p>
              <p className="text-stone-600">{order.deliveryAddress.area}, {order.deliveryAddress.city}</p>
              <p className="text-stone-500">{order.deliveryAddress.province} - {order.deliveryAddress.postalCode}</p>
              {order.deliveryAddress.deliveryInstructions && (
                <p className="text-[11px] text-amber-800 mt-1 italic">
                  Note: "{order.deliveryAddress.deliveryInstructions}"
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left text-xs mb-6">
            <thead>
              <tr className="border-b border-stone-300 text-stone-500 uppercase tracking-wider font-semibold">
                <th className="py-2">Item Description</th>
                <th className="py-2 text-center">Size</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Price (PKR)</th>
                <th className="py-2 text-right">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {order.items.map((item, idx) => (
                <tr key={idx} className="py-2">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.image || (item.sku ? `/uploads/products/${item.sku.toLowerCase()}.jpg` : '/uploads/products/placeholder.svg')}
                        alt={item.name}
                        className="w-8 h-8 rounded object-cover bg-stone-100 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/uploads/products/placeholder.svg';
                        }}
                      />
                      <div>
                        <span className="font-bold text-stone-900">{item.name}</span>
                        <span className="text-[10px] text-stone-400 block font-mono">{item.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 text-center font-medium text-stone-700">{item.size}</td>
                  <td className="py-2.5 text-center font-mono tabular-nums">{item.quantity}</td>
                  <td className="py-2.5 text-right font-mono tabular-nums">{item.unitPrice.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-mono tabular-nums font-bold text-stone-900">
                    {item.itemTotal.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Totals */}
          <div className="flex justify-between items-start border-t border-stone-200 pt-4 text-xs">
            <div className="max-w-xs text-stone-500">
              <p className="font-semibold text-stone-700 mb-1">Payment Information:</p>
              <p>Method: <span className="font-medium text-stone-900">{order.paymentMethod}</span></p>
              <p>Payment Status: <span className="font-medium text-stone-900">{order.paymentStatus}</span></p>
              {order.orderNotes && (
                <p className="mt-2 text-[11px] italic">Order Special Notes: "{order.orderNotes}"</p>
              )}
            </div>

            <div className="w-64 space-y-1.5">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums font-medium">PKR {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery Charges</span>
                <span className="font-mono tabular-nums font-medium">
                  {order.deliveryFee === 0 ? 'FREE' : `PKR ${order.deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Provincial Sales Tax (5%)</span>
                <span className="font-mono tabular-nums font-medium">PKR {order.taxAmount.toLocaleString()}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount ({order.couponCode || 'Coupon'})</span>
                  <span className="font-mono tabular-nums">-PKR {order.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-2 border-t border-stone-300">
                <span>Grand Total</span>
                <span className="text-base text-amber-700 font-mono tabular-nums">
                  PKR {order.grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-4 border-t border-stone-200 text-center text-[11px] text-stone-400">
            <p>Thank you for choosing Pizza House Pakistan! For feedback, call +92 300 1234567.</p>
            <p className="mt-0.5">This is a system-generated commercial tax invoice.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
