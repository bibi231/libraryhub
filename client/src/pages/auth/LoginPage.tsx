import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const from = (location.state as { from?: string })?.from || '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      const { user } = useAuthStore.getState();
      toast.success(`Welcome back, ${user?.firstName}!`);
      if (user?.role === 'patron') navigate('/patron');
      else navigate('/admin');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — illustration panel */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col items-center justify-center p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 31px)' }} />
        </div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-white mb-4">LibraryHub</h1>
          <p className="text-indigo-200 text-lg max-w-xs">
            "A reader lives a thousand lives before he dies. The man who never reads lives only one."
          </p>
          <p className="mt-4 text-indigo-300 text-sm">— George R.R. Martin</p>

          <div className="mt-12 grid grid-cols-3 gap-6">
            {['10,000+ Books', '5,000+ Members', 'Free Access'].map((stat) => (
              <div key={stat} className="text-center">
                <p className="text-white font-bold text-sm">{stat}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right — form panel */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex-1 flex items-center justify-center p-8"
      >
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-serif font-bold text-stone-900">LibraryHub</span>
            </Link>
            <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-50">Welcome back</h2>
            <p className="mt-2 text-stone-500">Sign in to your library account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-stone-400 hover:text-stone-600 p-1"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                <input type="checkbox" className="rounded" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={isLoading} className="w-full" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
              Sign In
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200" /></div>
              <div className="relative flex justify-center text-sm"><span className="bg-cream-50 dark:bg-navy-900 px-3 text-stone-400">or</span></div>
            </div>
            <div className="mt-4 space-y-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => { setEmail('patron@libraryhub.ng'); setPassword('Patron1234!'); }}
              >
                Use Demo Patron Account
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => { setEmail('librarian@libraryhub.ng'); setPassword('Admin1234!'); }}
              >
                Use Demo Librarian Account
              </Button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-stone-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Get your library card
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
