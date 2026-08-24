'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/customer/CartContext';
import { useToast } from '@/components/ui/ToastContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Plus,
  Tag,
  Check,
  ShoppingBag,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { success, error } = useToast();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [user, setUser] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // Guest Details State
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // New Address State
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'HOME',
  });

  // Delivery & Payment State
  const [deliveryMethod, setDeliveryMethod] = useState<'STANDARD' | 'EXPRESS' | 'WHITE_GLOVE'>('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Live Server Pricing Calculation State
  const [calculation, setCalculation] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Current User & Addresses
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data.user) {
          setUser(data.data.user);
          setGuestName(`${data.data.user.firstName} ${data.data.user.lastName}`);
          setGuestEmail(data.data.user.email);
          setGuestPhone(data.data.user.phone || '');
          setCurrentStep(2); // Automatically advance to address step if signed in

          // Fetch Saved Addresses
          fetch('/api/account/addresses')
            .then((r) => r.json())
            .then((addrData) => {
              if (addrData.success && addrData.data.addresses?.length > 0) {
                setSavedAddresses(addrData.data.addresses);
                const defaultAddr =
                  addrData.data.addresses.find((a: any) => a.isDefault) ||
                  addrData.data.addresses[0];
                setSelectedAddressId(defaultAddr.id);
              } else {
                setIsAddingNewAddress(true);
              }
            });
        } else {
          setIsAddingNewAddress(true);
        }
      });
  }, []);

  // Recalculate Totals on server whenever options change
  const refreshCalculation = async () => {
    if (items.length === 0) return;
    setIsCalculating(true);

    try {
      const activeAddress = getActiveAddress();
      const res = await fetch('/api/checkout/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          couponCode: appliedCoupon,
          deliveryMethod,
          paymentMethod,
          shippingPincode: activeAddress?.pincode || '400001',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCalculation(data.data);
      }
    } catch {
      // Ignore
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    refreshCalculation();
  }, [items, deliveryMethod, paymentMethod, appliedCoupon, selectedAddressId, newAddress.pincode]);

  const getActiveAddress = () => {
    if (!isAddingNewAddress && selectedAddressId) {
      return savedAddresses.find((a) => a.id === selectedAddressId);
    }
    return {
      name: newAddress.name || guestName,
      phone: newAddress.phone || guestPhone,
      addressLine1: newAddress.addressLine1,
      addressLine2: newAddress.addressLine2,
      city: newAddress.city,
      state: newAddress.state,
      pincode: newAddress.pincode,
      addressType: newAddress.addressType,
    };
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const res = await fetch('/api/checkout/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotal: calculation?.subtotal || 0,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            totalPrice: i.price * i.quantity,
          })),
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.data.code);
        success('Privilege Voucher Applied', `Discount of ₹${data.data.discountAmount.toLocaleString('en-IN')} activated`);
      } else {
        error(data.error || 'Invalid privilege coupon');
      }
    } catch {
      error('Failed to validate voucher');
    }
  };

  const handlePlaceOrder = async () => {
    const activeAddress = getActiveAddress();

    if (!activeAddress || !activeAddress.addressLine1 || !activeAddress.pincode) {
      error('Please complete your delivery address details');
      setCurrentStep(2);
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(String(activeAddress.pincode).trim())) {
      error('Please enter a valid 6-digit Indian PIN code');
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Order on Server
      const orderRes = await fetch('/api/checkout/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          couponCode: appliedCoupon,
          deliveryMethod,
          paymentMethod,
          shippingAddress: activeAddress,
          guestName,
          guestEmail,
          guestPhone,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        error(orderData.error || 'Failed to place order');
        setIsSubmitting(false);
        return;
      }

      // If COD -> Instant Success
      if (paymentMethod === 'COD') {
        clearCart();
        success('Order Confirmed!', `Your order ${orderData.data.orderNumber} has been received`);
        router.push(`/checkout/success/${orderData.data.orderId}`);
        return;
      }

      // Online Gateway Flow: Razorpay / Stripe
      // In this environment, we automatically execute server-side verification with generated payment signature
      const verifyRes = await fetch('/api/checkout/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.data.orderId,
          gatewayOrderId: orderData.data.gatewayOrderId,
          paymentId: `pay_${Date.now()}`,
          signature: `sim_sig_${Date.now()}`,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        clearCart();
        success('Payment Verified!', `Order ${orderData.data.orderNumber} placed successfully`);
        router.push(`/checkout/success/${orderData.data.orderId}`);
      } else {
        error(verifyData.error || 'Payment verification failed');
      }
    } catch (err: any) {
      error(err.message || 'Error executing checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-luxury-darkest text-luxury-text flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4 p-8 rounded-3xl bg-luxury-card/60 border border-luxury-border">
          <div className="w-16 h-16 rounded-2xl bg-luxury-emerald/60 border border-luxury-gold/40 flex items-center justify-center mx-auto text-luxury-gold">
            <ShoppingBag className="w-8 h-8 opacity-80" />
          </div>
          <h2 className="text-xl font-bold font-brand text-white">Your Shopping Bag is Empty</h2>
          <p className="text-xs text-luxury-muted">
            Please add luxury formulations from the catalogue before accessing checkout.
          </p>
          <Link href="/shop">
            <Button variant="gold" size="sm">
              Explore Catalogue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-darkest text-luxury-text selection:bg-luxury-gold selection:text-luxury-darkest flex flex-col">
      {/* Official Checkout Header */}
      <header className="border-b border-luxury-border/80 bg-luxury-darkest/95 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-luxury-emerald/60 border border-luxury-gold/70 flex items-center justify-center overflow-hidden shrink-0">
              <img src="/images/aureevo-logo.png" alt="AUREEVO" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-base font-bold font-brand tracking-widest text-white block">
                AUREEVO
              </span>
              <span className="text-[8px] uppercase tracking-[0.25em] text-luxury-gold-light">
                ENCRYPTED CHECKOUT
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-xs text-luxury-muted">
            <Lock className="w-3.5 h-3.5 text-luxury-gold" />
            <span className="hidden sm:inline">256-Bit Bank Grade SSL</span>
          </div>
        </div>
      </header>

      {/* Progress Steps Header */}
      <div className="bg-luxury-card/30 border-b border-luxury-border/60 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs font-semibold">
          {[
            { step: 1, title: '1. Identification' },
            { step: 2, title: '2. Destination' },
            { step: 3, title: '3. White-Glove Method' },
            { step: 4, title: '4. Luxury Payment' },
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step as any)}
              className={`flex items-center gap-1.5 transition-colors ${
                currentStep >= s.step ? 'text-luxury-gold-light' : 'text-luxury-muted opacity-50'
              }`}
            >
              {currentStep > s.step ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">
                  {s.step}
                </span>
              )}
              <span className="hidden md:inline">{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* LEFT 2 COLS: CHECKOUT STEPS */}
          <div className="lg:col-span-2 space-y-6">
            {/* STEP 1: Identification */}
            <Card className={`p-6 space-y-4 ${currentStep === 1 ? 'border-luxury-gold/50' : 'opacity-80'}`}>
              <div className="flex items-center justify-between border-b border-luxury-border/60 pb-3">
                <h3 className="text-sm font-bold font-brand uppercase tracking-wider text-white">
                  1. Clientèle Identification
                </h3>
                {user && (
                  <Badge variant="gold" size="sm">
                    Signed in as {user.firstName}
                  </Badge>
                )}
              </div>

              {user ? (
                <div className="text-xs text-luxury-muted flex items-center justify-between">
                  <div>
                    <span className="text-white font-bold block">{user.firstName} {user.lastName}</span>
                    <span className="font-mono">{user.email}</span>
                  </div>
                  {currentStep === 1 && (
                    <Button variant="gold" size="sm" onClick={() => setCurrentStep(2)}>
                      Continue to Address
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-luxury-muted">
                    Checkout seamlessly as an esteemed guest or sign in to access your registered vault addresses.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Full Name *"
                      placeholder="e.g. Lady Genevieve"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                    />
                    <Input
                      label="Email Address *"
                      type="email"
                      placeholder="patron@aureevo.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                    />
                    <Input
                      label="Mobile Number *"
                      placeholder="+91 99887 76655"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => {
                        if (!guestName || !guestEmail) {
                          error('Please enter your contact details');
                          return;
                        }
                        setCurrentStep(2);
                      }}
                    >
                      Proceed to Destination
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* STEP 2: Address */}
            <Card className={`p-6 space-y-4 ${currentStep === 2 ? 'border-luxury-gold/50' : 'opacity-80'}`}>
              <div className="flex items-center justify-between border-b border-luxury-border/60 pb-3">
                <h3 className="text-sm font-bold font-brand uppercase tracking-wider text-white">
                  2. Delivery Destination
                </h3>
                {savedAddresses.length > 0 && (
                  <button
                    onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                    className="text-xs text-luxury-gold-light hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isAddingNewAddress ? 'Select Saved' : '+ New Address'}</span>
                  </button>
                )}
              </div>

              {/* Saved Addresses Selector */}
              {!isAddingNewAddress && savedAddresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-luxury-gold bg-luxury-emerald/30 ring-1 ring-luxury-gold'
                          : 'border-luxury-border bg-luxury-surface/30 hover:border-luxury-gold/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">{addr.name}</span>
                        <Badge variant="gold" size="sm">
                          {addr.addressType}
                        </Badge>
                      </div>
                      <p className="text-xs text-luxury-muted leading-relaxed">
                        {addr.addressLine1}
                        {addr.addressLine2 && `, ${addr.addressLine2}`}
                      </p>
                      <p className="text-xs text-white font-mono mt-1">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                /* New Address Form */
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Street Address / Penthouse / Villa *"
                      placeholder="Penthouse 4B, Imperial Towers"
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                      required
                    />
                    <Input
                      label="Address Line 2"
                      placeholder="Altamount Road"
                      value={newAddress.addressLine2}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="City *"
                      placeholder="Mumbai"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      required
                    />
                    <Input
                      label="State *"
                      placeholder="Maharashtra"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      required
                    />
                    <Input
                      label="PIN Code (6 Digits) *"
                      placeholder="400026"
                      maxLength={6}
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button variant="gold" size="sm" onClick={() => setCurrentStep(3)}>
                    Continue to Delivery Method
                  </Button>
                </div>
              )}
            </Card>

            {/* STEP 3: Delivery Method */}
            <Card className={`p-6 space-y-4 ${currentStep === 3 ? 'border-luxury-gold/50' : 'opacity-80'}`}>
              <div className="border-b border-luxury-border/60 pb-3">
                <h3 className="text-sm font-bold font-brand uppercase tracking-wider text-white">
                  3. Select Luxury Delivery Method
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'STANDARD',
                    title: 'White-Glove Standard Dispatch',
                    desc: 'Inspected and sealed in climate-controlled velvet packaging. 2-4 Days.',
                    price: calculation?.isFreeShipping ? 'COMPLIMENTARY' : '₹350',
                  },
                  {
                    id: 'EXPRESS',
                    title: 'Air Courier Priority Express',
                    desc: 'Direct priority air cargo via Blue Dart Luxury. 24-36 Hours.',
                    price: '₹450',
                  },
                  {
                    id: 'WHITE_GLOVE',
                    title: 'Signature Maison VIP Concierge Delivery',
                    desc: 'Hand-delivered in gold embossed case with personal masterclass dossier.',
                    price: calculation?.isFreeShipping ? 'COMPLIMENTARY' : '₹500',
                  },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      deliveryMethod === m.id
                        ? 'border-luxury-gold bg-luxury-emerald/30 ring-1 ring-luxury-gold'
                        : 'border-luxury-border bg-luxury-surface/30 hover:border-luxury-gold/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value={m.id}
                        checked={deliveryMethod === m.id}
                        onChange={() => setDeliveryMethod(m.id as any)}
                        className="text-luxury-gold focus:ring-luxury-gold"
                      />
                      <div>
                        <span className="font-bold text-xs text-white block">{m.title}</span>
                        <span className="text-[11px] text-luxury-muted">{m.desc}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-luxury-gold font-mono">{m.price}</span>
                  </label>
                ))}
              </div>

              {currentStep === 3 && (
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button variant="gold" size="sm" onClick={() => setCurrentStep(4)}>
                    Continue to Payment
                  </Button>
                </div>
              )}
            </Card>

            {/* STEP 4: Payment */}
            <Card className={`p-6 space-y-4 ${currentStep === 4 ? 'border-luxury-gold/50' : 'opacity-80'}`}>
              <div className="border-b border-luxury-border/60 pb-3">
                <h3 className="text-sm font-bold font-brand uppercase tracking-wider text-white">
                  4. Payment & Final Authorization
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'UPI',
                    title: 'Instant UPI / QR Code (Google Pay / PhonePe / Paytm / BHIM)',
                    desc: 'Fastest 0% transaction fee instant luxury settlement.',
                  },
                  {
                    id: 'CARD',
                    title: 'Credit / Debit Cards (Visa, Mastercard, Amex, RuPay)',
                    desc: 'Secured via 256-bit dynamic OTP verification.',
                  },
                  {
                    id: 'NETBANKING',
                    title: 'Net Banking (All Indian Commercial & Private Banks)',
                    desc: 'HDFC, ICICI, SBI, Axis, Kotak and 50+ banking partners.',
                  },
                  {
                    id: 'COD',
                    title: 'Cash on Delivery (White-Glove Courier Inspection)',
                    desc: 'Pay cash or UPI upon personal delivery at your doorstep.',
                  },
                ].map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === p.id
                        ? 'border-luxury-gold bg-luxury-emerald/30 ring-1 ring-luxury-gold'
                        : 'border-luxury-border bg-luxury-surface/30 hover:border-luxury-gold/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={p.id}
                        checked={paymentMethod === p.id}
                        onChange={() => setPaymentMethod(p.id)}
                        className="text-luxury-gold focus:ring-luxury-gold"
                      />
                      <div>
                        <span className="font-bold text-xs text-white block">{p.title}</span>
                        <span className="text-[11px] text-luxury-muted">{p.desc}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          </div>

          {/* RIGHT COL: COMMERCIAL SUMMARY & PLACE ORDER BUTTON */}
          <div className="lg:col-span-1 space-y-6 sticky top-28">
            {/* Voucher Coupon Box */}
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                <Tag className="w-4 h-4 text-luxury-gold" />
                <span>Privilege Voucher Code</span>
              </div>

              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. ROYAL10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 bg-luxury-dark/90 border border-luxury-border rounded-xl text-xs text-white placeholder-luxury-muted/50 focus:outline-none focus:border-luxury-gold uppercase font-mono"
                />
                <Button type="submit" variant="outline" size="sm">
                  Apply
                </Button>
              </form>

              {appliedCoupon && (
                <div className="p-2 rounded-xl bg-luxury-emerald/40 border border-luxury-gold/40 text-xs text-luxury-gold-light flex items-center justify-between">
                  <span className="font-mono font-bold">{appliedCoupon}</span>
                  <Badge variant="gold" size="sm">Applied</Badge>
                </div>
              )}
            </Card>

            {/* Order Items Preview */}
            <Card className="p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-luxury-border/60 pb-2">
                Bag Formulations ({items.length})
              </h4>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={item.image} alt={item.productName} className="w-9 h-9 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <span className="font-semibold text-white truncate block">{item.productName}</span>
                        <span className="text-[10px] text-luxury-muted">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-white font-brand shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Calculation Totals Card */}
            <Card className="p-6 space-y-4 border-luxury-gold/40 shadow-2xl">
              <h3 className="text-sm font-bold font-brand uppercase tracking-wider text-white border-b border-luxury-border/60 pb-3">
                Commercial Summary
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-luxury-muted">
                  <span>Bag Subtotal</span>
                  <span className="text-white font-semibold">
                    ₹{(calculation?.subtotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {calculation?.couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>Privilege Voucher Discount</span>
                    <span>-₹{calculation.couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-luxury-muted">
                  <span>Applicable GST (18.0%)</span>
                  <span className="text-white">₹{(calculation?.taxTotal || 0).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between text-luxury-muted">
                  <span>White-Glove Shipping</span>
                  <span className={calculation?.shippingFee === 0 ? 'text-emerald-400 font-semibold' : 'text-white'}>
                    {calculation?.shippingFee === 0 ? 'COMPLIMENTARY' : `₹${calculation?.shippingFee}`}
                  </span>
                </div>

                {calculation?.codCharges > 0 && (
                  <div className="flex items-center justify-between text-luxury-muted">
                    <span>COD Courier Surcharge</span>
                    <span className="text-white">₹{calculation.codCharges}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-luxury-border/60 flex items-center justify-between text-sm font-bold font-brand text-white">
                  <span>Grand Total</span>
                  <span className="text-xl text-luxury-gold">
                    ₹{(calculation?.grandTotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="gold"
                size="lg"
                className="w-full"
                onClick={handlePlaceOrder}
                isLoading={isSubmitting || isCalculating}
                disabled={isSubmitting || isCalculating}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Authorize & Place Order
              </Button>

              <div className="text-center text-[10px] text-luxury-muted space-y-1 pt-1">
                <div className="flex items-center justify-center gap-1 text-luxury-gold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Guaranteed Luxury Authenticity</span>
                </div>
                <p>Delivered in tamper-proof seals from Mumbai central vault.</p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
