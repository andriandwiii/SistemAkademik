'use client';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link untuk konsistensi
import ToastNotifier from '../../../../components/ToastNotifier';
import '@/styles/gradient.css';
import axios from 'axios';

// --- Tipe dan Data Konstan ---

type ToastNotifierHandle = {
  showToast: (status: string, message?: string) => void;
};

const genderOptions = [
  { label: 'Laki-laki', value: 'L' },
  { label: 'Perempuan', value: 'P' },
];

const RegisterSiswaPage = () => {
  const router = useRouter();
  const toastRef = useRef<ToastNotifierHandle>(null);

  const [form, setForm] = useState({
    nis: '',
    nisn: '',
    nama: '',
    email: '',
    password: '',
    gender: '',
    tgl_lahir: null as Date | null,
  });

  const [loading, setLoading] = useState(false);

  // Handler ini hanya untuk InputText
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        nis: form.nis.trim(),
        nisn: form.nisn.trim(),
        nama: form.nama.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
        gender: form.gender,
        tgl_lahir: form.tgl_lahir
          ? form.tgl_lahir.toISOString().split('T')[0] // format YYYY-MM-DD
          : null,
        status: 'Aktif',
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register-siswa`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      toastRef.current?.showToast('00', 'Siswa berhasil didaftarkan');

      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
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
      <div className="animated-gradient-bg w-full h-full flex justify-content-center align-items-center p-4">
        {/* Card disamakan dengan halaman register guru */}
        <div className="card w-full md:w-8 lg:w-7 h-auto p-5 shadow-3 rounded-lg">
          {/* Layout Flexbox untuk centering vertikal */}
          <div className="flex flex-column md:flex-row items-center">
            
            {/* Kolom Form (Kiri) */}
            <div className="w-full md:w-6/12 p-fluid px-4">
              <h3 className="text-2xl text-center font-semibold mb-5">
                Registrasi Akun Siswa
              </h3>
              
              <form className="grid formgrid" onSubmit={handleSubmit}>
                
                {/* BARIS 1: NIS dan NISN */}
                <div className="field col-12 md:col-6">
                  <label htmlFor="nis" className="block text-900 font-medium mb-2">NIS</label>
                  <InputText 
                    id="nis" 
                    value={form.nis} 
                    onChange={handleChange} 
                    placeholder="Contoh: 231234" 
                    required 
                  />
                </div>
                <div className="field col-12 md:col-6">
                  <label htmlFor="nisn" className="block text-900 font-medium mb-2">NISN</label>
                  <InputText 
                    id="nisn" 
                    value={form.nisn} 
                    onChange={handleChange} 
                    placeholder="Contoh: 1234567890" 
                    required 
                  />
                </div>

                {/* BARIS 2: Nama Lengkap */}
                <div className="field col-12">
                  <label htmlFor="nama" className="block text-900 font-medium mb-2">Nama Lengkap</label>
                  <InputText 
                    id="nama" 
                    value={form.nama} 
                    onChange={handleChange} 
                    placeholder="Masukkan nama lengkap" 
                    required 
                  />
                </div>
                
                {/* BARIS 3: Email dan Password */}
                <div className="field col-12 md:col-6">
                  <label htmlFor="email" className="block text-900 font-medium mb-2">Email</label>
                  <InputText 
                    id="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    placeholder="email@anda.com" 
                    type="email" 
                    required 
                  />
                </div>
                <div className="field col-12 md:col-6">
                  <label htmlFor="password" className="block text-900 font-medium mb-2">Password</label>
                  <InputText 
                    id="password" 
                    value={form.password} 
                    onChange={handleChange} 
                    placeholder="Min. 8 karakter" 
                    type="password" 
                    required 
                  />
                </div>

                {/* BARIS 4: Gender dan Tanggal Lahir */}
                <div className="field col-12 md:col-6">
                  <label className="block text-900 font-medium mb-2">Jenis Kelamin</label>
                  <Dropdown 
                    value={form.gender} 
                    options={genderOptions} 
                    onChange={(e) => setForm((prev) => ({ ...prev, gender: e.value }))} 
                    placeholder="Pilih Gender" 
                    required 
                  />
                </div>
                <div className="field col-12 md:col-6">
                  <label className="block text-900 font-medium mb-2">Tanggal Lahir</label>
                  <Calendar 
                    value={form.tgl_lahir} 
                    onChange={(e) => setForm((prev) => ({ ...prev, tgl_lahir: e.value as Date }))} 
                    dateFormat="yy-mm-dd" 
                    showIcon 
                    placeholder="YYYY-MM-DD" 
                    required 
                  />
                </div>

                {/* Tombol Register */}
                <div className="col-12 mt-4">
                  <Button 
                    type="submit" 
                    label={loading ? 'Memproses...' : 'Daftar Sekarang'} 
                    disabled={loading} 
                    className="w-full p-3" 
                  />
                </div>
                
                {/* Link ke halaman Login */}
                <div className="col-12 text-center mt-3">
                    <span>Sudah punya akun? </span>
                    <Link href="/auth/login" className="text-blue-500 hover:underline font-semibold">
                        Login disini
                    </Link>
                </div>
              </form>
            </div>

            {/* Kolom Kanan: Gambar */}
            <div className="hidden md:block md:w-6/12 px-4"> 
              <img
                src="https://www.pinhome.id/info-area/wp-content/uploads/2022/04/Cover-17.jpg"
                className="w-full h-full object-cover rounded-lg" 
                alt="Ilustrasi siswa sedang belajar"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterSiswaPage;