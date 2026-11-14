import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle2, AlertCircle, Printer, XCircle, ChevronRight, Phone } from 'lucide-react';
import { api } from '../api';
import { Order, OrderStatus } from '../types';
import { OrderInvoiceModal } from '../components/OrderInvoiceModal';

interface OrderTrackingViewProps {
  initialOrderNumber?: string;
  setCurrentView: (view: string) => void;
}

const ORDER_STEPS: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready for Pickup',
  'Out for Delivery',
  'Delivered'
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderNumber,
  setCurrentView
}) => {
  const [searchQuery, setSearchQuery] = useState(initialOrderNumber || 'PH-2026-1002');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cancellation modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('Change of plan / Placed order by mistake');
  const [cancelling, setCancelling] = useState(false);

  // Invoice modal
  const [showInvoice, setShowInvoice] = useState(false);

  const fetchOrder = async (orderIdOrNumber: string) => {
    if (!orderIdOrNumber.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getOrder(orderIdOrNumber.trim());
      setOrder(res.order);
    } catch (err: any) {
      setError(err.message || 'Order not found. Please check order number format (e.g. PH-2026-1001).');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      setSearchQuery(initialOrderNumber);
      fetchOrder(initialOrderNumber);
    } else {
      fetchOrder('PH-2026-1002');
    }
  }, [initialOrderNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(searchQuery);
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const res = await api.cancelOrder(order._id, cancellationReason, 'Customer (Self-Service)');
      setOrder(res.order);
      setShowCancelModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const currentStepIndex = order ? ORDER_STEPS.indexOf(order.orderStatus) : -1;
  const isCancelled = order?.orderStatus === 'Cancelled';
  const canCancel = order && (order.orderStatus === 'Pending' || order.orderStatus === 'Confirmed');

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Title & Search Bar */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs mb-8">
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight mb-2">
            Live Kitchen Order Tracking
          </h1>
          <p className="text-xs text-stone-500 mb-6">
            Track your freshly baked Pakistani pizza through every stage from our stone oven to your doorstep.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Enter Order Number (e.g. PH-2026-1001 or PH-2026-1002)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs font-mono border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-medium mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Order Details Display */}
        {order && (
          <div className="space-y-6">
            {/* Status Hero Card */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                      Order Reference
                    </span>
                    <span className="text-lg font-extrabold text-stone-900 font-mono">
                      {order.orderNumber}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowInvoice(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Tax Invoice</span>
                  </button>

                  {canCancel && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Flow */}
              {isCancelled ? (
                <div className="py-8 text-center bg-red-50/50 rounded-xl my-4 border border-red-100">
                  <XCircle className="w-10 h-10 text-red-600 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-red-900">Order Cancelled</h3>
                  <p className="text-xs text-red-700 max-w-sm mx-auto mt-1">
                    Reason: {order.cancellationReason || 'Cancelled upon customer or admin request.'}
                  </p>
                </div>
              ) : (
                <div className="py-6">
                  {/* Step Indicators */}
                  <div className="relative">
                    {/* Connecting Bar */}
                    <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-stone-200 -translate-y-1/2 z-0" />
                    <div
                      className="hidden sm:block absolute top-1/2 left-0 h-1 bg-amber-600 -translate-y-1/2 z-0 transition-all duration-500"
                      style={{
                        width: `${Math.max(0, (currentStepIndex / (ORDER_STEPS.length - 1)) * 100)}%`
                      }}
                    />

                    <div className="relative z-10 grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
                      {ORDER_STEPS.map((step, idx) => {
                        const isDone = currentStepIndex >= idx;
                        const isCurrent = currentStepIndex === idx;

                        return (
                          <div key={step} className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs mb-2 ${
                                isCurrent
                                  ? 'bg-amber-600 text-white ring-4 ring-amber-100 scale-110'
                                  : isDone
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white border-2 border-stone-300 text-stone-400'
                              }`}
                            >
                              {isDone && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span
                              className={`text-[11px] font-semibold block leading-tight ${
                                isCurrent
                                  ? 'text-amber-700'
                                  : isDone
                                  ? 'text-stone-900'
                                  : 'text-stone-400'
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Audit Log Timeline */}
              <div className="mt-6 pt-6 border-t border-stone-100">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">
                  Status Transition Log & Kitchen Audit:
                </h4>
                <div className="space-y-3">
                  {order.statusHistory.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{item.status}</span>
                          <span className="text-stone-400">·</span>
                          <span className="text-stone-500 font-mono text-[11px]">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-stone-400">·</span>
                          <span className="text-stone-600 font-medium">By: {item.updatedBy}</span>
                        </div>
                        {item.note && (
                          <p className="text-stone-500 text-[11px] mt-0.5">{item.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivery & Items Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Address */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs text-xs">
                <h3 className="font-bold text-stone-900 uppercase tracking-wider mb-3 text-stone-500">
                  Delivery Destination
                </h3>
                <p className="font-bold text-stone-900 text-sm">{order.customerName}</p>
                <p className="text-stone-600 font-mono mt-0.5">{order.customerPhone}</p>
                <p className="text-stone-700 mt-2 font-medium">
                  {order.deliveryAddress.houseNumber}, {order.deliveryAddress.street}
                </p>
                <p className="text-stone-500">
                  {order.deliveryAddress.area}, {order.deliveryAddress.city} ({order.deliveryAddress.province})
                </p>
                {order.deliveryAddress.deliveryInstructions && (
                  <p className="text-amber-800 text-[11px] mt-2 italic">
                    Instructions: "{order.deliveryAddress.deliveryInstructions}"
                  </p>
                )}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2 text-stone-500">
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  <span>Rider Helpline: +92 300 1234567</span>
                </div>
              </div>

              {/* Items in order */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs text-xs">
                <h3 className="font-bold text-stone-900 uppercase tracking-wider mb-3 text-stone-500">
                  Ordered Pizzas ({order.items.length})
                </h3>
                <div className="space-y-2.5 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1.5 border-b border-stone-50 gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.image || (item.sku ? `/uploads/products/${item.sku.toLowerCase()}.jpg` : '/uploads/products/placeholder.svg')}
                          alt={item.name}
                          className="w-9 h-9 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/uploads/products/placeholder.svg';
                          }}
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-stone-900 block truncate">{item.name}</span>
                          <span className="text-stone-500 block text-[11px]">
                            {item.size} · Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono tabular-nums font-semibold text-stone-900 shrink-0">
                        PKR {item.itemTotal.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 pt-2 border-t border-stone-100 text-stone-600">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-medium text-stone-900">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <span className="font-semibold text-stone-900">{order.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between font-bold text-stone-900 text-sm pt-2 border-t border-stone-200">
                    <span>Grand Total:</span>
                    <span className="text-amber-600 font-mono tabular-nums">
                      PKR {order.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-stone-200">
              <h3 className="text-base font-bold text-stone-900 mb-2">Cancel Order Confirmation</h3>
              <p className="text-xs text-stone-500 mb-4">
                Are you sure you want to cancel order #{order?.orderNumber}? Cancellation is permitted while the order is still Pending or Confirmed.
              </p>

              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Reason for Cancellation *
              </label>
              <select
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg mb-6 bg-white"
              >
                <option value="Change of mind / Placed by mistake">Change of mind / Placed by mistake</option>
                <option value="Order taking longer than expected">Order taking longer than expected</option>
                <option value="Incorrect address entered">Incorrect address entered</option>
                <option value="Ordered duplicate pizzas">Ordered duplicate pizzas</option>
                <option value="Other customer reason">Other customer reason</option>
              </select>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tax Invoice Modal */}
        <OrderInvoiceModal
          order={order}
          isOpen={showInvoice}
          onClose={() => setShowInvoice(false)}
        />
      </div>
    </div>
  );
};
