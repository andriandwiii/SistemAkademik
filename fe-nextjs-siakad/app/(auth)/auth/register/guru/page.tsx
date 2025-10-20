'use client';
import React, { useRef, useState, FC } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { InputText } from 'primereact/inputtext';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import ToastNotifier from '../../../../components/ToastNotifier';
import '@/styles/gradient.css';
import axios from 'axios';

type ToastNotifierHandle = {
  showToast: (status: string, message?: string) => void;
};

// Interface untuk data form guru
interface GuruFormData {
  nip: string;
  nama: string;
  gelar_depan: string;
  gelar_belakang: string;
  pangkat: string;
  jabatan: string;
  status_kepegawaian: string;
  gender: string;
  tgl_lahir: Date | null;
  tempat_lahir: string;
  email: string;
  no_telp: string;
  alamat: string;
  password: string;
}

const GENDER_OPTIONS = [
  { label: 'Laki-laki', value: 'L' },
  { label: 'Perempuan', value: 'P' },
];

const RegisterGuruPage: FC = () => {
  const router = useRouter();
  const toastRef = useRef<ToastNotifierHandle>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<GuruFormData>({
    nip: '',
    nama: '',
    gelar_depan: '',
    gelar_belakang: '',
    pangkat: '',
    jabatan: '',
    status_kepegawaian: 'Aktif',
    gender: '',
    tgl_lahir: null,
    tempat_lahir: '',
    email: '',
    no_telp: '',
    alamat: '',
    password: '',
  });

  // Handler untuk mengubah state form
  const handleChange = (name: keyof GuruFormData, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handler untuk submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        tgl_lahir: form.tgl_lahir?.toISOString().split('T')[0] || null,
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register-guru`,
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      toastRef.current?.showToast('00', 'Guru berhasil didaftarkan!');
      setTimeout(() => router.push('/auth/login'), 1500);
    } catch (err: any)      {
      toastRef.current?.showToast(
        '99',
        err.response?.data?.message || 'Terjadi kesalahan pada server.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Konfigurasi field form untuk rendering dinamis
  const formFields = [
    { name: 'nip', label: 'NIP', component: InputText, required: true, colSpan: 12 },
    { name: 'nama', label: 'Nama Lengkap', component: InputText, required: true, colSpan: 12 },
    { name: 'gelar_depan', label: 'Gelar Depan', component: InputText, colSpan: 6 },
    { name: 'gelar_belakang', label: 'Gelar Belakang', component: InputText, colSpan: 6 },
    { name: 'pangkat', label: 'Pangkat', component: InputText, colSpan: 6 },
    { name: 'jabatan', label: 'Jabatan', component: InputText, colSpan: 6 },
    { name: 'email', label: 'Email', component: InputText, type: 'email', required: true, colSpan: 12 },
    { name: 'gender', label: 'Jenis Kelamin', component: Dropdown, options: GENDER_OPTIONS, required: true, placeholder: 'Pilih Gender', colSpan: 6 },
    { name: 'tgl_lahir', label: 'Tanggal Lahir', component: Calendar, dateFormat: 'yy-mm-dd', showIcon: true, placeholder: 'YYYY-MM-DD', colSpan: 6 },
    { name: 'tempat_lahir', label: 'Tempat Lahir', component: InputText, colSpan: 6 },
    { name: 'no_telp', label: 'No. Telepon', component: InputText, colSpan: 6 },
    { name: 'alamat', label: 'Alamat', component: InputText, colSpan: 12 },
    { name: 'password', label: 'Password', component: InputText, type: 'password', required: true, colSpan: 12 },
  ];

  // Fungsi untuk me-render setiap field
  const renderField = (field: any) => {
    const { name, component: Component, colSpan, ...rest } = field;
    const commonProps = {
      id: name,
      name,
      value: form[name as keyof GuruFormData],
      className: 'w-full',
      ...rest,
    };

    const onChangeHandler =
      Component === Calendar
        ? (e: any) => handleChange(name, e.value)
        : Component === Dropdown
        ? (e: DropdownChangeEvent) => handleChange(name, e.value)
        : (e: React.ChangeEvent<HTMLInputElement>) => handleChange(name, e.target.value);

    return (
      <div key={name} className={`field col-12 md:col-${colSpan} mb-3`}>
        <label htmlFor={name} className="block text-900 font-medium mb-1">
          {rest.label} {rest.required && <span className="text-red-500">*</span>}
        </label>
        <Component {...commonProps} onChange={onChangeHandler} />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex justify-content-center align-items-center">
      <ToastNotifier ref={toastRef} />
      <div className="animated-gradient-bg w-full h-full flex justify-content-center align-items-center p-4">
        {/* === UKURAN CARD DIUBAH DI SINI === */}
        <div className="card w-full md:w-8 lg:w-7 h-auto p-5 shadow-3 rounded-lg">
          <div className="flex flex-column md:flex-row items-center">
            {/* Kolom Form (Kiri) */}
            <div className="w-full md:w-6/12 p-fluid px-4">
              <h3 className="text-2xl text-center font-semibold mb-5">
                Registrasi Akun Guru
              </h3>
              <form onSubmit={handleSubmit} className="grid formgrid">
                {formFields.map(renderField)}
                <div className="col-12 mt-4">
                  <Button
                    type="submit"
                    label={loading ? 'Memproses...' : 'Daftar Sekarang'}
                    disabled={loading}
                    className="w-full p-3"
                    icon={loading ? 'pi pi-spin pi-spinner' : undefined}
                    iconPos="right"
                  />
                </div>
                
                <div className="col-12 text-center mt-3">
                  <span>Sudah punya akun? </span>
                  <Link href="/auth/login" className="text-blue-500 hover:underline font-semibold">
                    Login disini
                  </Link>
                </div>
              </form>
            </div>

            {/* Kolom Gambar (Kanan) */}
            <div className="hidden md:block md:w-6/12 px-4">
              <img
                src="https://www.darulilmimurni.sch.id/upload/imagecache/21317206GreenandOrangeColorfulInternationalTeachersDayInstagramPost-800x800.png"
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

export default RegisterGuruPage;