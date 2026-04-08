'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Camera, Shield, Lock, Mail } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { setAuth } from '@/lib/auth';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    defaultValues: { email: 'admin@cctvshop.com', password: 'admin123' },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await authAPI.login(data.email, data.password);
      setAuth(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      router.replace('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — CCTV Camera Art */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary-900">
        {/* SVG CCTV Background Pattern */}
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 600 700" fill="none">
            {/* Grid lines */}
            {[...Array(12)].map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 60} x2="600" y2={i * 60} stroke="#60a5fa" strokeWidth="0.5"/>
            ))}
            {[...Array(10)].map((_, i) => (
              <line key={`v${i}`} x1={i * 60} y1="0" x2={i * 60} y2="700" stroke="#60a5fa" strokeWidth="0.5"/>
            ))}
          </svg>

          {/* Scanning lines animation */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-40"
              style={{ animation: 'scanLine 3s linear infinite', top: 0 }}/>
          </div>
        </div>

        {/* Decorative CCTV cameras as SVG */}
        <div className="absolute top-16 left-20 opacity-20">
          <CctvCameraIcon size={80} />
        </div>
        <div className="absolute top-40 right-12 opacity-15 rotate-45">
          <CctvCameraIcon size={50} />
        </div>
        <div className="absolute bottom-32 left-16 opacity-20 -rotate-12">
          <CctvCameraIcon size={60} />
        </div>
        <div className="absolute bottom-20 right-24 opacity-15">
          <CctvCameraIcon size={40} />
        </div>

        {/* Radar circles */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {[120, 180, 240].map((r) => (
            <div key={r} className="absolute rounded-full border border-blue-400 opacity-20"
              style={{ width: r, height: r, top: -r/2, left: -r/2 }}/>
          ))}
          <div className="w-4 h-4 bg-blue-400 rounded-full opacity-60"/>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">CCTV Shop Manager</h1>
              <p className="text-blue-300 text-sm">Professional Billing System</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4">
            Manage Your Shop<br />
            <span className="text-blue-400">Smarter & Faster</span>
          </h2>

          <p className="text-blue-200 text-lg mb-10 leading-relaxed">
            Complete billing, product management, and GST invoice system
            built for CCTV and electronics shops.
          </p>

          <div className="space-y-4">
            {[
              { icon: '📦', text: 'Product & Stock Management' },
              { icon: '🧾', text: 'GST Invoice & Estimate Generation' },
              { icon: '📊', text: 'Sales Dashboard & Analytics' },
              { icon: '📄', text: 'PDF Invoice Download' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-xl">{f.icon}</span>
                <span className="text-blue-100">{f.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 p-4 bg-blue-800 bg-opacity-50 rounded-xl border border-blue-700">
            <p className="text-blue-300 text-sm">
              <Shield className="inline w-4 h-4 mr-1" />
              <strong>Demo Credentials:</strong> admin@cctvshop.com / admin123
            </p>
          </div>
        </div>

        <style>{`
          @keyframes scanLine {
            0% { top: 0; opacity: 0; }
            10% { opacity: 0.4; }
            90% { opacity: 0.4; }
            100% { top: 100%; opacity: 0; }
          }
        `}</style>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">CCTV Shop Manager</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 mt-1">Sign in to your shop dashboard</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="admin@cctvshop.com"
                    className={`input-field pl-10 ${errors.email ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                    })}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center text-base py-3"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-700 font-medium mb-1">Demo Login:</p>
              <p className="text-xs text-blue-600">Email: admin@cctvshop.com</p>
              <p className="text-xs text-blue-600">Password: admin123</p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            CCTV Shop Manager &copy; {new Date().getFullYear()} — Secure &amp; Professional
          </p>
        </div>
      </div>
    </div>
  );
}

function CctvCameraIcon({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Mount */}
      <rect x="44" y="0" width="12" height="15" rx="2" fill="#60a5fa"/>
      {/* Body */}
      <rect x="20" y="14" width="55" height="28" rx="8" fill="#3b82f6"/>
      {/* Lens */}
      <circle cx="68" cy="28" r="11" fill="#1e3a8a"/>
      <circle cx="68" cy="28" r="7" fill="#0f172a"/>
      <circle cx="68" cy="28" r="3" fill="#1d4ed8"/>
      <circle cx="71" cy="25" r="1.5" fill="#93c5fd" opacity="0.8"/>
      {/* IR LEDs */}
      <circle cx="30" cy="22" r="2" fill="#ef4444" opacity="0.8"/>
      <circle cx="38" cy="22" r="2" fill="#ef4444" opacity="0.8"/>
      <circle cx="30" cy="35" r="2" fill="#ef4444" opacity="0.8"/>
      <circle cx="38" cy="35" r="2" fill="#ef4444" opacity="0.8"/>
    </svg>
  );
}
