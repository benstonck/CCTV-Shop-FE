'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Settings, Save, Store, Lock } from 'lucide-react';
import { settingsAPI, authAPI } from '@/lib/api';
import { ShopSettings } from '@/types';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm<ShopSettings>();
  const { register: regPw, handleSubmit: handlePw, reset: resetPw, formState: { errors: pwErrors } } = useForm<{
    currentPassword: string; newPassword: string; confirmPassword: string;
  }>();

  useEffect(() => {
    settingsAPI.get().then(res => res.data.settings && reset(res.data.settings)).catch(console.error);
  }, [reset]);

  const onSaveSettings = async (data: ShopSettings) => {
    setLoading(true);
    try {
      await settingsAPI.update(data);
      toast.success('Shop settings saved!');
    } catch { toast.error('Failed to save settings'); }
    finally { setLoading(false); }
  };

  const onChangePassword = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (data.newPassword !== data.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (data.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setPwLoading(true);
    try {
      await authAPI.changePassword(data.currentPassword, data.newPassword);
      toast.success('Password changed successfully!');
      resetPw();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally { setPwLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage shop info and account settings</p>
      </div>

      {/* Shop Settings */}
      <form onSubmit={handleSubmit(onSaveSettings)} className="card space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Store className="w-4 h-4 text-blue-600" /> Shop Information
        </h3>
        <p className="text-xs text-gray-500">This info appears on your PDF invoices.</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Shop Name *</label>
          <input className="input-field" placeholder="Your CCTV Shop" {...register('shop_name')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
          <textarea rows={2} className="input-field resize-none" placeholder="Shop address..." {...register('address')} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input className="input-field" placeholder="+91 98765 43210" {...register('phone')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" className="input-field" placeholder="shop@example.com" {...register('email')} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">GSTIN</label>
          <input className="input-field font-mono" placeholder="29AABCU9603R1ZX" {...register('gstin')} />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Settings</>}
        </button>
      </form>

      {/* Change Password */}
      <form onSubmit={handlePw(onChangePassword)} className="card space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600" /> Change Password
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
          <input type="password" className={`input-field ${pwErrors.currentPassword ? 'border-red-400' : ''}`}
            {...regPw('currentPassword', { required: 'Required' })} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <input type="password" className={`input-field ${pwErrors.newPassword ? 'border-red-400' : ''}`}
              placeholder="Min. 6 characters"
              {...regPw('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} />
            {pwErrors.newPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.newPassword.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <input type="password" className={`input-field ${pwErrors.confirmPassword ? 'border-red-400' : ''}`}
              {...regPw('confirmPassword', { required: 'Required' })} />
          </div>
        </div>

        <button type="submit" disabled={pwLoading} className="btn-primary">
          {pwLoading ? 'Changing...' : <><Lock className="w-4 h-4" /> Change Password</>}
        </button>
      </form>

      {/* App Info */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4" /> About
        </h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p>CCTV Shop Manager v1.0.0</p>
          <p>Built with Next.js + Node.js + SQLite</p>
          <p className="text-xs text-gray-400 mt-2">Default login: admin@cctvshop.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
