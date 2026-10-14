'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Lock, CreditCard, ShieldCheck, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PK ||
  'pk_test_51Tgf9n4BFwPZ19zGpqJGktc5xiWHJzA3h31mJawTQpLxhzsrHhrUGvBVY6kd9INR9vsTVIXDZ7JJPgGKCxrEhrsK00PH4IztcT'
);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#e0e7ff',
      fontFamily: '"Inter", Arial, sans-serif',
      fontSize: '15px',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#4a4e72' },
      iconColor: '#6366f1',
    },
    invalid: {
      color: '#f43f5e',
      iconColor: '#f43f5e',
    },
  },
  hidePostalCode: false,
};

interface PaymentFormProps {
  clientSecret: string;
  courseId: string;
  courseTitle: string;
  amount: number;
}

function PaymentForm({ clientSecret, courseId, courseTitle, amount }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);
    if (!card) return;

    setLoading(true);
    setCardError(null);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (error) {
      setCardError(error.message || 'Payment failed');
      toast.error(error.message || 'Payment failed');
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      toast.success('Payment successful! Redirecting to your course…');
      setTimeout(() => {
        router.push(`/courses/${courseId}/learn`);
      }, 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white/5 border border-indigo-500/15 rounded-xl p-4">
        <p className="text-xs text-indigo-300/50 uppercase tracking-wider mb-1">You are purchasing</p>
        <p className="text-white font-medium text-sm leading-snug">{courseTitle}</p>
        <p className="text-2xl font-bold text-white mt-3 flex items-center gap-1.5">
          <span>₹{amount.toLocaleString('en-IN')}</span>
          <span className="text-xs font-normal text-teal-300 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full ml-1.5">INR</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-indigo-100/80 mb-2">
          Card details
        </label>
        <div className="px-4 py-3.5 bg-white/5 border border-indigo-400/20 rounded-lg focus-within:ring-2 focus-within:ring-indigo-400/50 transition">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        {cardError && (
          <p className="text-red-400 text-sm mt-2">{cardError}</p>
        )}
      </div>

      <div className="flex items-center gap-2 text-indigo-300/40 text-xs">
        <ShieldCheck size={13} />
        <span>Payments processed securely by Stripe. We never store card details.</span>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Lock size={16} />
            Pay ₹{amount.toLocaleString('en-IN')}
          </>
        )}
      </button>

      <p className="text-center text-indigo-300/30 text-xs">
        By completing this purchase, you agree to our Terms of Service.
      </p>
    </form>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  const { isAuthenticated } = useAuthStore();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const initCheckout = () => {
    if (!courseId) {
      setError('No course specified.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    api.post('/payments/create-intent', { courseId })
      .then(res => {
        setClientSecret(res.data.clientSecret);
        setAmount(res.data.amount);
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Could not initialize checkout. Please check back shortly.';
        setError(msg);
      })
      .finally(() => setLoading(false));

    api.get(`/courses/${courseId}`)
      .then(res => setCourseTitle(res.data.data?.title || ''))
      .catch(() => {});
  };

  useEffect(() => {
    if (!mounted) return;

    // Check if user has token in localStorage before prematurely assuming unauthenticated
    let hasAuth = isAuthenticated;
    if (!hasAuth && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('auth-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.state?.token) {
            hasAuth = true;
          }
        }
      } catch (e) {}
    }

    if (!hasAuth) {
      router.push(`/login?redirect=/checkout?courseId=${courseId}`);
      return;
    }

    initCheckout();
  }, [courseId, isAuthenticated, mounted, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
          <p className="text-indigo-300/50 text-sm">Preparing secure checkout…</p>
        </div>
      </div>
    );
  }

  const handleSimulateEnroll = async () => {
    try {
      setLoading(true);
      const res = await api.post('/payments/simulate-enroll', { courseId });
      if (res.data.success) {
        toast.success('Enrolled successfully! Redirecting to course...');
        setTimeout(() => {
          router.push(`/courses/${courseId}/learn`);
        }, 1000);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to enroll');
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-card border border-indigo-500/30 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Lock size={22} />
          </div>
          <p className="text-white text-lg font-semibold mb-1">Payment Gateway Notice</p>
          <p className="text-indigo-300/60 text-xs mb-6 leading-relaxed">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleSimulateEnroll}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-teal-500/25 text-sm"
            >
              <span>Instant Test Access (Demo Sandbox)</span>
            </button>
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={initCheckout}
                className="px-4 py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 text-xs font-semibold transition"
              >
                Try again
              </button>
              <Link href="/courses"
                className="inline-flex items-center gap-1.5 text-indigo-300/60 hover:text-white text-xs transition">
                <ArrowLeft size={13} /> Browse courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md">
        <Link href={`/courses/${courseId}`}
          className="inline-flex items-center gap-1.5 text-indigo-300/50 hover:text-indigo-200 text-sm mb-5 transition">
          <ArrowLeft size={14} /> Back to course
        </Link>

        <div className="glass-card rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-7">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-teal-400 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
              <CreditCard size={22} className="text-[#05060f]" />
            </div>
            <h1 className="text-xl font-semibold text-white">Complete your purchase</h1>
            <p className="text-indigo-200/50 text-sm mt-1">Secure checkout powered by Stripe</p>
          </div>

          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                clientSecret={clientSecret}
                courseId={courseId!}
                courseTitle={courseTitle}
                amount={amount}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
