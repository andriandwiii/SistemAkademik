'use client';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { roleRoutes } from 'utils/roleRoutes';
import ToastNotifier from '../../../components/ToastNotifier';
import '@/styles/gradient.css';
import axios from 'axios';

type ToastNotifierHandle = {
  showToast: (status: string, message?: string) => void;
};

const LoginPage = () => {
  const router = useRouter();
  const toastRef = useRef<ToastNotifierHandle>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        { email, password },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true, // kalau backend pakai cookie/session
        }
      );

      const data = res.data;

      if (!data || !data.token || !data.user) {
        toastRef.current?.showToast('01', data.message || 'Login gagal');
        setLoading(false);
        return;
      }

      // ✅ simpan token & role
      localStorage.setItem('token', data.token);
      localStorage.setItem('ROLE', data.user.role);
      localStorage.setItem('USER_NAME', data.user.name || '');

      toastRef.current?.showToast('00', 'Login berhasil');

      // ✅ redirect sesuai role
      const redirect = roleRoutes[data.user.role] || '/';
      router.push(redirect);
    } catch (err: any) {
      toastRef.current?.showToast(
        '99',
        err.response?.data?.message || 'Terjadi kesalahan koneksi'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-content-center align-items-center">
      <ToastNotifier ref={toastRef} />
      <div className="animated-gradient-bg w-full h-full flex justify-content-center align-items-center">
        <div className="card w-full md:w-6 h-auto p-5 shadow-3 rounded-lg">
          <div className="grid h-full">
            {/* Form */}
            <div className="col-12 md:col-6 flex flex-col justify-center h-full px-4">
              <div>
                <h3 className="text-2xl text-center font-semibold mb-5">
                  {process.env.NEXT_PUBLIC_APP_NAME ||
                    'Sistem Informasi Akademik SMA'}
                </h3>

                <form className="grid" onSubmit={handleSubmit}>
                  <div className="col-12 mb-4">
                    <label htmlFor="email" className="block text-sm font-semibold">
                      Email
                    </label>
                    <InputText
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="col-12 mb-4">
                    <label htmlFor="password" className="block text-sm font-semibold">
                      Password
                    </label>
                    <InputText
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="col-12 mb-4">
                    <Button
                      type="submit"
                      label={loading ? 'Loading...' : 'Login'}
                      disabled={loading}
                      className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Gambar */}
            <div className="hidden md:block md:col-6 h-full">
              <img
                src="https://serayunews.pw/wp-content/uploads/2025/04/1000238162.png"
                className="w-full h-full object-cover rounded-lg"
                alt="cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
