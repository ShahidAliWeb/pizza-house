import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ShieldCheck, MapPin, CreditCard, Banknote, Building2, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../api';
import { Address, Order } from '../types';

interface CustomerCheckoutProps {
  setCurrentView: (view: string) => void;
  setActiveOrderNumber: (orderNumber: string) => void;
}

export const CustomerCheckout: React.FC<CustomerCheckoutProps> = ({
  setCurrentView,
  setActiveOrderNumber
}) => {
  const { user } = useAuth();
  const {
    items,
    subtotal,
    deliveryFee,
    taxAmount,
    discountAmount,
    couponCode,
    grandTotal,
    clearCart
  } = useCart();

  // Customer Contact Fields
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+923');

  // Address fields
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string>('new');
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Karachi');
  const [province, setProvince] = useState('Sindh');
  const [postalCode, setPostalCode] = useState('75300');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Payment & Notes
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Bank Transfer' | 'Online Payment'>('Cash on Delivery');
  const [orderNotes, setOrderNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync user changes
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.fullName);
      if (!customerEmail) setCustomerEmail(user.email);
      if (user.phone && (!customerPhone || customerPhone === '+923')) setCustomerPhone(user.phone);

      const defaultAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      if (defaultAddr) {
        setSelectedSavedAddressId(defaultAddr.id);
        setHouseNumber(defaultAddr.houseNumber);
        setStreet(defaultAddr.street);
        setArea(defaultAddr.area);
        setCity(defaultAddr.city);
        setProvince(defaultAddr.province);
        setPostalCode(defaultAddr.postalCode);
        setDeliveryInstructions(defaultAddr.deliveryInstructions || '');
      }
    }
  }, [user]);

  const handleSelectSavedAddress = (addrId: string) => {
    setSelectedSavedAddressId(addrId);
    if (addrId === 'new') {
      setHouseNumber('');
      setStreet('');
      setArea('');
      setDeliveryInstructions('');
    } else {
      const addr = user?.addresses.find((a) => a.id === addrId);
      if (addr) {
        setHouseNumber(addr.houseNumber);
        setStreet(addr.street);
        setArea(addr.area);
        setCity(addr.city);
        setProvince(addr.province);
        setPostalCode(addr.postalCode);
        setDeliveryInstructions(addr.deliveryInstructions || '');
      }
    }
  };

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    if (newCity === 'Karachi') {
      setProvince('Sindh');
      setPostalCode('75300');
    } else if (newCity === 'Lahore' || newCity === 'Faisalabad' || newCity === 'Multan' || newCity === 'Rawalpindi') {
      setProvince('Punjab');
      setPostalCode(newCity === 'Lahore' ? '54000' : '46000');
    } else if (newCity === 'Islamabad') {
      setProvince('Islamabad Capital Territory');
      setPostalCode('44000');
    } else if (newCity === 'Peshawar') {
      setProvince('Khyber Pakhtunkhwa');
      setPostalCode('25000');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Your shopping cart is empty.');
      return;
    }

    // Validate Pakistani Phone
    const phoneRegex = /^\+92[0-9]{10}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      setError('Please provide a valid Pakistani mobile number in format: +923XXXXXXXXX');
      return;
    }

    if (!houseNumber.trim() || !street.trim() || !area.trim() || !city.trim()) {
      setError('Please fill in complete delivery address details (House/flat, street, area, and city).');
      return;
    }

    setLoading(true);

    try {
      const deliveryAddress: Address = {
        id: 'addr-' + Date.now(),
        label: 'Home',
        houseNumber: houseNumber.trim(),
        street: street.trim(),
        area: area.trim(),
        city: city.trim(),
        province: province.trim(),
        postalCode: postalCode.trim(),
        deliveryInstructions: deliveryInstructions.trim() || undefined
      };

      const orderPayload = {
        customerId: user?._id || 'guest-' + Date.now(),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || 'customer@pizzahouse.pk',
        customerPhone: customerPhone.trim(),
        deliveryAddress,
        orderNotes: orderNotes.trim() || undefined,
        items: items.map((i) => ({
          pizzaId: i.pizza._id,
          size: i.size,
          quantity: i.quantity
        })),
        couponCode: couponCode || undefined,
        paymentMethod
      };

      const res = await api.createOrder(orderPayload);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}

      clearCart();
      setActiveOrderNumber(res.order.orderNumber);
      setCurrentView('track');
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 py-16 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-stone-200 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 text-3xl flex items-center justify-center mx-auto mb-4">
            🍕
          </div>
          <h2 className="text-xl font-bold text-stone-900">Your cart is currently empty</h2>
          <p className="text-xs text-stone-500 mt-2 mb-6">
            Please add some delicious wood-fired pizzas to your cart before proceeding to checkout.
          </p>
          <button
            onClick={() => setCurrentView('menu')}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Explore Pizza House Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Checkout & Delivery Confirmation
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Please verify your contact details and delivery destination in Pakistan.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form Columns (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Customer Contact Info */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                <span>Customer Contact Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Usman Tahir"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Mobile Phone (+92) *</label>
                  <input
                    type="text"
                    required
                    placeholder="+923001234567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">Format: +923XXXXXXXXX</span>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.pk"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Address */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                <span>Delivery Address (Pakistan)</span>
              </h2>

              {/* Saved Address Selector if logged in */}
              {user && user.addresses?.length > 0 && (
                <div className="mb-5 pb-4 border-b border-stone-100">
                  <label className="block text-xs font-semibold text-stone-700 mb-2">
                    Choose from Saved Addresses:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {user.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectSavedAddress(addr.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                          selectedSavedAddressId === addr.id
                            ? 'border-amber-600 bg-amber-50/40 text-stone-900 font-medium'
                            : 'border-stone-200 text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-stone-900">{addr.label}</span>
                          {selectedSavedAddressId === addr.id && (
                            <Check className="w-3.5 h-3.5 text-amber-600" />
                          )}
                        </div>
                        <p className="truncate text-stone-500">{addr.houseNumber}, {addr.street}</p>
                        <p className="text-stone-400 text-[11px]">{addr.area}, {addr.city}</p>
                      </div>
                    ))}

                    <div
                      onClick={() => handleSelectSavedAddress('new')}
                      className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-center transition ${
                        selectedSavedAddressId === 'new'
                          ? 'border-amber-600 bg-amber-50/40 text-amber-800 font-bold'
                          : 'border-dashed border-stone-300 text-stone-500 hover:border-stone-400'
                      }`}
                    >
                      + Use Another / Custom Address
                    </div>
                  </div>
                </div>
              )}

              {/* Address Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">House / Flat / Building *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 402, Al-Razi Heights"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Street / Block / Road *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Block 13-D, University Road"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Area / Sector / Phase *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gulshan-e-Iqbal, DHA Phase 5, F-7"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">City *</label>
                  <select
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none bg-white"
                  >
                    <option value="Karachi">Karachi (Sindh)</option>
                    <option value="Lahore">Lahore (Punjab)</option>
                    <option value="Islamabad">Islamabad (ICT)</option>
                    <option value="Rawalpindi">Rawalpindi (Punjab)</option>
                    <option value="Faisalabad">Faisalabad (Punjab)</option>
                    <option value="Peshawar">Peshawar (KP)</option>
                    <option value="Multan">Multan (Punjab)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Province</label>
                  <input
                    type="text"
                    readOnly
                    value={province}
                    className="w-full px-3 py-2 border border-stone-200 bg-stone-100 text-stone-600 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Special Delivery Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ring bell twice, lift available, leave at front gate"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] flex items-center justify-center font-bold">3</span>
                <span>Payment Method</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-amber-600 bg-amber-50/50 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2 text-stone-900 font-bold">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Cash on Delivery</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Pay in exact cash to our delivery rider when hot pizzas reach your doorstep.
                  </p>
                </div>

                {/* Bank Transfer */}
                <div
                  onClick={() => setPaymentMethod('Bank Transfer')}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    paymentMethod === 'Bank Transfer'
                      ? 'border-amber-600 bg-amber-50/50 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2 text-stone-900 font-bold">
                    <Building2 className="w-4 h-4 text-sky-600" />
                    <span>Direct Bank Transfer</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Transfer via Raast / 1Link to our official Meezan Bank account.
                  </p>
                </div>

                {/* Online Payment */}
                <div
                  onClick={() => setPaymentMethod('Online Payment')}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    paymentMethod === 'Online Payment'
                      ? 'border-amber-600 bg-amber-50/50 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2 text-stone-900 font-bold">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span>Card / Online Pay</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Pay via Visa / MasterCard or PayPak.
                  </p>
                </div>
              </div>

              {/* Bank Details Callout */}
              {paymentMethod === 'Bank Transfer' && (
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs space-y-1.5">
                  <p className="font-bold text-sky-900">Official Pakistani Bank Account Details:</p>
                  <p className="text-sky-800">Bank: <span className="font-semibold">Meezan Bank Ltd (Islamic Banking)</span></p>
                  <p className="text-sky-800">Account Title: <span className="font-semibold">Pizza House Foods Pvt Ltd</span></p>
                  <p className="text-sky-800 font-mono">IBAN: <span className="font-bold">PK36MEZN0001234567890123</span></p>
                  <p className="text-sky-800 font-mono">Account No: <span className="font-bold">010203040506</span></p>
                  <p className="text-[11px] text-sky-700 italic pt-1">
                    * Please share the transaction receipt with the rider or WhatsApp to +92 300 1234567.
                  </p>
                </div>
              )}

              {/* Kitchen Special Notes */}
              <div className="mt-4 pt-4 border-t border-stone-100">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Order Kitchen Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please make chicken extra spicy, keep oregano on the side"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right Summary Column (4 cols) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider pb-3 border-b border-stone-100">
              Order Review & Summary
            </h3>

            {/* Items review */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-stone-900">{item.pizza.name}</span>
                    <span className="text-stone-500 block text-[11px]">
                      {item.size} · Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums font-semibold text-stone-800">
                    PKR {(item.unitPrice * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-3 border-t border-stone-100 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-stone-900 font-medium">
                  PKR {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="font-mono tabular-nums text-stone-900 font-medium">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  ) : (
                    `PKR ${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Provincial Sales Tax (5%)</span>
                <span className="font-mono tabular-nums text-stone-900 font-medium">
                  PKR {taxAmount.toLocaleString()}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({couponCode})</span>
                  <span className="font-mono tabular-nums">-PKR {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-3 border-t border-stone-200">
                <span>Total Amount Due</span>
                <span className="text-base text-amber-600 font-mono tabular-nums">
                  PKR {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Submit Confirmation Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 active:scale-98 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Confirming Order...' : 'Confirm & Place Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-time kitchen tracking enabled upon order placement</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
