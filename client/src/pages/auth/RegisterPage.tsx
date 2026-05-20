import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, ArrowLeft, Check, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { ID_TYPES } from '@/lib/constants';

const STEPS = [
  { title: 'Personal Info', desc: 'Your basic details' },
  { title: 'ID Verification', desc: 'Verify your identity' },
  { title: 'Library Card', desc: 'Your card is ready!' },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    idType: 'NIN',
    idNumber: '',
  });

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    try {
      await register(form);
      setStep(2);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 to-indigo-900 flex-col items-center justify-center p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-white mb-4">Join LibraryHub</h2>
          <p className="text-indigo-200 text-base max-w-xs">
            "Books are a uniquely portable magic."
          </p>
          <p className="mt-3 text-indigo-300 text-sm">— Stephen King</p>

          {/* Steps indicator */}
          <div className="mt-12 space-y-4">
            {STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 ${i <= step ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  i < step ? 'bg-teal-400 text-white' : i === step ? 'bg-white text-indigo-700' : 'bg-white/20 text-white'
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <div className="text-left">
                  <p className="text-white font-medium text-sm">{s.title}</p>
                  <p className="text-indigo-300 text-xs">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-serif font-bold text-stone-900">LibraryHub</span>
          </Link>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-50">Personal Info</h2>
                <p className="mt-2 text-stone-500 mb-8">Tell us about yourself</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="First Name" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="Ngozi" required />
                    <Input label="Last Name" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="Adeyemi" required />
                  </div>
                  <Input label="Email Address" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" required />
                  <Input label="Password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Min. 8 characters" required />
                  <Input label="Phone Number" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+234-800-000-0000" required />
                  <Input label="Home Address" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Your full address" required />
                  <Button
                    className="w-full"
                    size="lg"
                    icon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => {
                      if (!form.firstName || !form.email || !form.password || !form.phone || !form.address) {
                        toast.error('Please fill all required fields');
                        return;
                      }
                      setStep(1);
                    }}
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-50">ID Verification</h2>
                <p className="mt-2 text-stone-500 mb-8">We need to verify your identity</p>
                <div className="space-y-4">
                  <Select
                    label="ID Type"
                    value={form.idType}
                    onChange={(e) => update('idType', e.target.value)}
                    options={ID_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                  />
                  <Input
                    label="ID Number"
                    value={form.idNumber}
                    onChange={(e) => update('idNumber', e.target.value)}
                    placeholder="Enter your ID number"
                    required
                    className="font-mono"
                  />
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 text-sm text-indigo-700 dark:text-indigo-300">
                    Your ID is stored securely and used only for identity verification.
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setStep(0)} icon={<ArrowLeft className="w-4 h-4" />}>
                      Back
                    </Button>
                    <Button
                      className="flex-1"
                      loading={isLoading}
                      onClick={handleSubmit}
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      Get My Library Card
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-10 h-10 text-teal-600" />
                </motion.div>
                <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-50 mb-2">Welcome to LibraryHub!</h2>
                <p className="text-stone-500 mb-8">Your library card has been issued</p>

                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white mb-8 shadow-warm-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-indigo-200" />
                    <span className="text-indigo-200 text-sm">Library Card</span>
                  </div>
                  <p className="font-serif text-xl font-bold mb-1">{useAuthStore.getState().user?.firstName} {useAuthStore.getState().user?.lastName}</p>
                  <p className="font-mono text-indigo-200 text-sm tracking-wider">{useAuthStore.getState().user?.libraryCardNumber}</p>
                </div>

                <Button className="w-full" size="lg" onClick={() => navigate('/patron')}>
                  Go to My Dashboard
                </Button>
                <Button variant="secondary" className="w-full mt-3" onClick={() => navigate('/catalog')}>
                  Browse Catalog
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {step < 2 && (
            <p className="mt-8 text-center text-sm text-stone-500">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
