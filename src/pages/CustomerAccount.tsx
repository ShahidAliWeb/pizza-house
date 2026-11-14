import React, { useState, useEffect } from 'react';
import { User, MapPin, Package, Lock, LogOut, Plus, Trash2, CheckCircle2, AlertCircle, Printer, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Order, Address } from '../types';
import { OrderInvoiceModal } from '../components/OrderInvoiceModal';

interface CustomerAccountProps {
  setCurrentView: (view: string) => void;
  setActiveOrderNumber: (orderNumber: string) => void;
  openAuthModal: () => void;
}

export const CustomerAccount: React.FC<CustomerAccountProps> = ({
  setCurrentView,
  setActiveOrderNumber,
  openAuthModal
}) => {
  const { user, logout, updateUserInContext } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile' | 'security'>('orders');
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [securityMsg, setSecurityMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Address Form Modal
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newHouse, setNewHouse] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newCity, setNewCity] = useState('Karachi');
  const [newProvince, setNewProvince] = useState('Sindh');
  const [newPostalCode, setNewPostalCode] = useState('75300');
  const [newInstructions, setNewInstructions] = useState('');
  const [newLabel, setNewLabel] = useState<'Home' | 'Office' | 'Other'>('Home');

  // Invoice modal
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhone(user.phone);
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const res = await api.getMyOrders(user._id);
      setMyOrders(res.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 py-16 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center max-w-sm w-full shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 text-2xl flex items-center justify-center mx-auto mb-4">
            👤
          </div>
          <h2 className="text-xl font-bold text-stone-900">Sign In to View Account</h2>
          <p className="text-xs text-stone-500 mt-2 mb-6">
            Sign in to access your previous pizza orders, saved Pakistani addresses, and active deliveries.
          </p>
          <button
            onClick={openAuthModal}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      const res = await api.updateProfile(user._id, { fullName, phone });
      updateUserInContext(res.user);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Update failed' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMsg(null);
    try {
      await api.changePassword(user._id, { currentPassword, newPassword });
      setSecurityMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setSecurityMsg({ type: 'error', text: err.message || 'Password update failed' });
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addAddress(user._id, {
        label: newLabel,
        houseNumber: newHouse,
        street: newStreet,
        area: newArea,
        city: newCity,
        province: newProvince,
        postalCode: newPostalCode,
        deliveryInstructions: newInstructions,
        isDefault: user.addresses.length === 0
      });
      updateUserInContext({ ...user, addresses: res.addresses });
      setShowAddAddress(false);
      setNewHouse('');
      setNewStreet('');
      setNewArea('');
      setNewInstructions('');
    } catch (err: any) {
      alert(err.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await api.deleteAddress(user._id, addressId);
      updateUserInContext({ ...user, addresses: res.addresses });
    } catch (err: any) {
      alert(err.message || 'Failed to delete address');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Banner Header */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-600 text-white font-extrabold text-xl flex items-center justify-center">
              {user.fullName[0]}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-stone-900">{user.fullName}</h1>
              <p className="text-xs text-stone-500 font-mono mt-0.5">{user.phone} · {user.email}</p>
              <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[11px] font-medium mt-1 uppercase">
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition w-fit"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="md:col-span-1 space-y-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition text-left ${
                activeTab === 'orders'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Order History ({myOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition text-left ${
                activeTab === 'addresses'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses ({user.addresses?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition text-left ${
                activeTab === 'profile'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition text-left ${
                activeTab === 'security'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Security & Password</span>
            </button>
          </div>

          {/* Main Content Area (3 cols) */}
          <div className="md:col-span-3">
            {/* 1. Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-stone-900">Your Past & Active Orders</h2>
                  <button
                    onClick={fetchOrders}
                    className="text-xs text-amber-600 hover:underline font-medium"
                  >
                    Refresh List
                  </button>
                </div>

                {loadingOrders ? (
                  <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
                    Loading your orders...
                  </div>
                ) : myOrders.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center">
                    <p className="text-xs text-stone-500 mb-4">You have not placed any orders yet.</p>
                    <button
                      onClick={() => setCurrentView('menu')}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-500 transition"
                    >
                      Browse Pizza Menu
                    </button>
                  </div>
                ) : (
                  myOrders.map((ord) => (
                    <div
                      key={ord._id}
                      className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                        <div>
                          <span className="font-extrabold font-mono text-sm text-stone-900">
                            {ord.orderNumber}
                          </span>
                          <span className="text-xs text-stone-400 ml-2">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                              ord.orderStatus === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.orderStatus === 'Cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="text-xs space-y-2">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-stone-600 gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={it.image || (it.sku ? `/uploads/products/${it.sku.toLowerCase()}.jpg` : '/uploads/products/placeholder.svg')}
                                alt={it.name}
                                className="w-8 h-8 rounded-md object-cover bg-stone-100 shrink-0 border border-stone-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/uploads/products/placeholder.svg';
                                }}
                              />
                              <span className="truncate">
                                {it.quantity}x {it.name} ({it.size})
                              </span>
                            </div>
                            <span className="font-mono tabular-nums font-semibold text-stone-900 shrink-0">
                              PKR {it.itemTotal.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Address & Grand Total */}
                      <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="text-stone-500">
                          <span>Delivered to: </span>
                          <span className="text-stone-800 font-medium">
                            {ord.deliveryAddress.area}, {ord.deliveryAddress.city}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div>
                            <span className="text-stone-500">Total: </span>
                            <span className="font-extrabold text-amber-600 font-mono text-sm tabular-nums">
                              PKR {ord.grandTotal.toLocaleString()}
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              setActiveOrderNumber(ord.orderNumber);
                              setCurrentView('track');
                            }}
                            className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition flex items-center gap-1"
                          >
                            <span>Live Track</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => setSelectedInvoiceOrder(ord)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                            title="Print Tax Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 2. Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-stone-900">Saved Delivery Addresses</h2>
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses?.map((addr) => (
                    <div
                      key={addr.id}
                      className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs text-xs relative flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-stone-900 text-sm">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-stone-800 font-medium">{addr.houseNumber}, {addr.street}</p>
                        <p className="text-stone-500">{addr.area}, {addr.city}</p>
                        <p className="text-stone-400 text-[11px]">{addr.province} - {addr.postalCode}</p>
                        {addr.deliveryInstructions && (
                          <p className="text-amber-800 text-[11px] mt-2 italic">
                            "{addr.deliveryInstructions}"
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-stone-400 hover:text-red-600 text-xs flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
                <h2 className="text-base font-bold text-stone-900 mb-4">Edit Profile Information</h2>
                {profileMsg && (
                  <div
                    className={`p-3 rounded-lg text-xs mb-4 ${
                      profileMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {profileMsg.text}
                  </div>
                )}
                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Mobile Phone (Pakistan)</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
                    />
                    <span className="text-[10px] text-stone-400 mt-0.5 block">Format: +923XXXXXXXXX</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full px-3 py-2 border border-stone-200 bg-stone-100 text-stone-500 rounded-lg cursor-not-allowed"
                    />
                    <span className="text-[10px] text-stone-400 mt-0.5 block">Email cannot be modified directly.</span>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    Save Profile Changes
                  </button>
                </form>
              </div>
            )}

            {/* 4. Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
                <h2 className="text-base font-bold text-stone-900 mb-4">Change Account Password</h2>
                {securityMsg && (
                  <div
                    className={`p-3 rounded-lg text-xs mb-4 ${
                      securityMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {securityMsg.text}
                  </div>
                )}
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Add Address Modal */}
        {showAddAddress && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-stone-200">
              <h3 className="text-base font-bold text-stone-900 mb-4">Add Pakistani Delivery Address</h3>
              <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Address Label</label>
                  <select
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">House / Flat / Building *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. House 42-A"
                    value={newHouse}
                    onChange={(e) => setNewHouse(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Street / Block *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Street 14, Sector F"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Area / Phase *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DHA Phase 5 / Gulshan"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">City</label>
                    <select
                      value={newCity}
                      onChange={(e) => {
                        const c = e.target.value;
                        setNewCity(c);
                        if (c === 'Karachi') { setNewProvince('Sindh'); setNewPostalCode('75300'); }
                        else if (c === 'Lahore') { setNewProvince('Punjab'); setNewPostalCode('54000'); }
                        else if (c === 'Islamabad') { setNewProvince('ICT'); setNewPostalCode('44000'); }
                      }}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                    >
                      <option value="Karachi">Karachi</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={newPostalCode}
                      onChange={(e) => setNewPostalCode(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Delivery Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Ring bell twice, leave with guard"
                    value={newInstructions}
                    onChange={(e) => setNewInstructions(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="px-4 py-2 border border-stone-300 rounded-lg font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        <OrderInvoiceModal
          order={selectedInvoiceOrder}
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      </div>
    </div>
  );
};
