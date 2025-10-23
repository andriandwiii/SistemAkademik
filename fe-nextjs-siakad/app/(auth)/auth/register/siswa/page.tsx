'use client';

// --- Imports Gabungan ---
import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { FileUpload } from 'primereact/fileupload';
import { InputTextarea } from 'primereact/inputtextarea';
import { Password } from 'primereact/password';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Asumsi path ini benar
import ToastNotifier from '../../../../components/ToastNotifier';
import '@/styles/gradient.css';

// --- Opsi Dropdown ---
const genderOptions = [
  { label: 'Laki-laki', value: 'L' },
  { label: 'Perempuan', value: 'P' },
];

const agamaOptions = [
  { label: 'Islam', value: 'Islam' },
  { label: 'Kristen', value: 'Kristen' },
  { label: 'Katholik', value: 'Katholik' },
  { label: 'Hindu', value: 'Hindu' },
  { label: 'Budha', value: 'Budha' },
  { label: 'Konghucu', value: 'Konghucu' },
];

// --- Tipe Toast ---
type ToastNotifierHandle = {
  showToast: (status: string, message?: string) => void;
};

// --- Komponen Utama ---
const RegisterSiswaPage = () => {
  const router = useRouter();
  const toastRef = useRef<ToastNotifierHandle>(null);

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nis: '',
    nisn: '',
    nama: '',
    gender: '',
    tempat_lahir: '',
    tgl_lahir: null as Date | null,
    alamat: '',
    no_telp: '',
    agama: '',
    gol_darah: '',
    tinggi_badan: '',
    berat_badan: '',
    kebutuhan_khusus: '',
    foto: null as File | null,
    namaAyah: '',
    pekerjaanAyah: '',
    pendidikanAyah: '',
    alamatAyah: '',
    noTelpAyah: '',
    namaIbu: '',
    pekerjaanIbu: '',
    pendidikanIbu: '',
    alamatIbu: '',
    noTelpIbu: '',
    namaWali: '',
    pekerjaanWali: '',
    pendidikanWali: '',
    alamatWali: '',
    noTelpWali: '',
  });

  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleDropdownChange = (e: { value: any }, id: string) => {
    setForm((prev) => ({ ...prev, [id]: e.value }));
  };

  const handleCalendarChange = (e: { value: any }, id: string) => {
     setForm((prev) => ({ ...prev, [id]: e.value }));
  }

  const handleFileUpload = (e: { files: File[] }) => {
    const file = e.files[0];
    setForm((prev) => ({ ...prev, foto: file }));
  };

  // --- Validasi & Submit ---
  const validatePassword = () => {
    // ... (validasi password tetap sama) ...
    if (form.password !== form.confirmPassword) {
        const msg = 'Password dan Konfirmasi Password tidak cocok.';
        setPasswordError(msg);
        toastRef.current?.showToast('99', msg);
        return false;
      }
      if (form.password.length < 8) {
        const msg = 'Password minimal 8 karakter.';
        setPasswordError(msg);
        toastRef.current?.showToast('99', msg);
        return false;
      }
      setPasswordError('');
      return true;
  };

  // ==============================================================
  // ========= PERBAIKAN UTAMA: Validasi Field Wajib di Sini ======
  // ==============================================================
  const validateRequiredFields = () => {
      const requiredFields: { key: keyof typeof form; label: string }[] = [
          { key: 'email', label: 'Email' },
          { key: 'password', label: 'Password' },
          { key: 'nis', label: 'NIS' },
          { key: 'nisn', label: 'NISN' },
          { key: 'nama', label: 'Nama Lengkap' },
          { key: 'gender', label: 'Jenis Kelamin' },
          // { key: 'tgl_lahir', label: 'Tanggal Lahir' }, // Tgl Lahir bisa opsional tergantung schema Zod
      ];

      for (const field of requiredFields) {
          if (!form[field.key]) { // Cek jika field kosong atau null
              const msg = `${field.label} wajib diisi.`;
              toastRef.current?.showToast('99', msg);
              return false; // Hentikan validasi jika ada yang kosong
          }
      }
      return true; // Semua field wajib terisi
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // 1. Validasi Password
    if (!validatePassword()) {
      setLoading(false);
      return;
    }

    // 2. Validasi Field Wajib Lainnya (TAMBAHAN)
    if (!validateRequiredFields()) {
        setLoading(false);
        return;
    }

    try {
      const formData = new FormData();

      // Data Akun
      formData.append('email', form.email);
      formData.append('password', form.password);

      // Data Identitas Siswa
      formData.append('NIS', form.nis);
      formData.append('NISN', form.nisn);
      formData.append('NAMA', form.nama);
      formData.append('GENDER', form.gender);
      formData.append('TEMPAT_LAHIR', form.tempat_lahir || ''); // Kirim string kosong jika null/kosong
      formData.append('TGL_LAHIR', form.tgl_lahir ? form.tgl_lahir.toISOString().split('T')[0] : '');
      formData.append('AGAMA', form.agama || '');
      formData.append('ALAMAT', form.alamat || '');
      formData.append('NO_TELP', form.no_telp || '');
      
      // Data Tambahan
      formData.append('GOL_DARAH', form.gol_darah || '');
      formData.append('TINGGI', form.tinggi_badan || '');
      formData.append('BERAT', form.berat_badan || '');
      formData.append('KEBUTUHAN_KHUSUS', form.kebutuhan_khusus || '');
      if (form.foto) {
        formData.append('FOTO', form.foto);
      }

      // Data Ayah (kirim string kosong jika tidak diisi)
      formData.append('NAMA_AYAH', form.namaAyah || '');
      formData.append('PEKERJAAN_AYAH', form.pekerjaanAyah || '');
      formData.append('PENDIDIKAN_AYAH', form.pendidikanAyah || '');
      formData.append('ALAMAT_AYAH', form.alamatAyah || '');
      formData.append('NO_TELP_AYAH', form.noTelpAyah || '');

      // Data Ibu
      formData.append('NAMA_IBU', form.namaIbu || '');
      formData.append('PEKERJAAN_IBU', form.pekerjaanIbu || '');
      formData.append('PENDIDIKAN_IBU', form.pendidikanIbu || '');
      formData.append('ALAMAT_IBU', form.alamatIbu || '');
      formData.append('NO_TELP_IBU', form.noTelpIbu || '');

      // Data Wali
      formData.append('NAMA_WALI', form.namaWali || '');
      formData.append('PEKERJAAN_WALI', form.pekerjaanWali || '');
      formData.append('PENDIDIKAN_WALI', form.pendidikanWali || '');
      formData.append('ALAMAT_WALI', form.alamatWali || '');
      formData.append('NO_TELP_WALI', form.noTelpWali || '');

      // POST ke API
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register-siswa`, 
        formData, 
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      // Logika Sukses
      toastRef.current?.showToast('00', 'Siswa berhasil didaftarkan');
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);

    } catch (err: any) {
      // Logika Error
      console.error('Error:', err);
      // Tampilkan error validasi dari Zod jika ada
      let errorMessage = 'Gagal melakukan registrasi siswa';
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
          errorMessage = err.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n');
      } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
      }
      toastRef.current?.showToast('99', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- Render JSX ---
  return (
    <div className="min-h-screen flex justify-content-center align-items-center">
      <ToastNotifier ref={toastRef} />
      <div className="animated-gradient-bg w-full h-full flex justify-content-center align-items-center p-4">
        
        <div className="card w-full md:w-10 lg:w-9 h-auto p-5 shadow-3 rounded-lg">
          <div className="flex flex-column md:flex-row items-center">
            
            <div className="w-full md:w-6/12 p-fluid px-4 md:max-h-screen md:overflow-y-auto">
              <h3 className="text-2xl text-center font-semibold mb-5">
                Registrasi Akun Siswa
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="p-fluid grid formgrid">
                  
                  {/* --- Data Akun --- */}
                  <div className="col-12">
                    <h3 className="font-semibold text-lg border-bottom-1 surface-border pb-2">Data Akun</h3>
                  </div>

                  <div className="field col-12">
                    <label htmlFor="email">Email (Untuk Login) <span className="text-red-500">*</span></label>
                    <InputText id="email" value={form.email} onChange={handleChange} type="email" required />
                  </div>

                  <div className="field col-12 md:col-6">
                    <label htmlFor="password">Password <span className="text-red-500">*</span></label>
                    <Password 
                      id="password" 
                      value={form.password} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                      toggleMask 
                      feedback={true}
                      required 
                    />
                  </div>

                  <div className="field col-12 md:col-6">
                    <label htmlFor="confirmPassword">Konfirmasi Password <span className="text-red-500">*</span></label>
                    <Password 
                      id="confirmPassword" 
                      value={form.confirmPassword} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      toggleMask 
                      feedback={false} 
                      required 
                    />
                    {passwordError && <small className="p-error">{passwordError}</small>}
                  </div>

                  {/* --- Data Diri Siswa --- */}
                  <div className="col-12 mt-4">
                    <h3 className="font-semibold text-lg border-bottom-1 surface-border pb-2">Data Diri Siswa</h3>
                  </div>

                  <div className="field col-12 md:col-6">
                    <label htmlFor="nis">NIS <span className="text-red-500">*</span></label>
                    <InputText id="nis" value={form.nis} onChange={handleChange} required />
                  </div>

                  <div className="field col-12 md:col-6">
                    <label htmlFor="nisn">NISN <span className="text-red-500">*</span></label>
                    <InputText id="nisn" value={form.nisn} onChange={handleChange} required />
                  </div>

                  <div className="field col-12">
                    <label htmlFor="nama">Nama Lengkap <span className="text-red-500">*</span></label>
                    <InputText id="nama" value={form.nama} onChange={handleChange} required />
                  </div>

                  <div className="field col-12 md:col-6">
                    <label htmlFor="gender">Jenis Kelamin <span className="text-red-500">*</span></label>
                    <Dropdown id="gender" value={form.gender} options={genderOptions} onChange={(e) => handleDropdownChange(e, 'gender')} placeholder="Pilih Jenis Kelamin" required />
                  </div>

                  <div className="field col-12 md:col-6">
                    <label htmlFor="agama">Agama</label>
                    <Dropdown id="agama" value={form.agama} options={agamaOptions} onChange={(e) => handleDropdownChange(e, 'agama')} placeholder="Pilih Agama" />
                  </div>

                  <div className="field col-12 md:col-6">
                    <label htmlFor="tempat_lahir">Tempat Lahir</label>
                    <InputText id="tempat_lahir" value={form.tempat_lahir} onChange={handleChange} />
                  </div>

                  {/* Tambahkan required jika wajib */}
                  <div className="field col-12 md:col-6">
                    <label htmlFor="tgl_lahir">Tanggal Lahir</label> 
                    <Calendar id="tgl_lahir" value={form.tgl_lahir} onChange={(e) => handleCalendarChange(e, 'tgl_lahir')} dateFormat="yy-mm-dd" showIcon required />
                  </div>

                  <div className="field col-12 md:col-4">
                    <label htmlFor="gol_darah">Golongan Darah</label>
                    <InputText id="gol_darah" value={form.gol_darah} onChange={handleChange} />
                  </div>

                  <div className="field col-12 md:col-4">
                    <label htmlFor="tinggi_badan">Tinggi Badan (cm)</label>
                    <InputText id="tinggi_badan" value={form.tinggi_badan} onChange={handleChange} keyfilter="int" />
                  </div>

                  <div className="field col-12 md:col-4">
                    <label htmlFor="berat_badan">Berat Badan (kg)</label>
                    <InputText id="berat_badan" value={form.berat_badan} onChange={handleChange} keyfilter="int" />
                  </div>

                  <div className="field col-12">
                    <label htmlFor="kebutuhan_khusus">Kebutuhan Khusus (Jika ada)</label>
                    <InputText id="kebutuhan_khusus" value={form.kebutuhan_khusus} onChange={handleChange} />
                  </div>

                  <div className="field col-12">
                    <label htmlFor="alamat">Alamat Lengkap Siswa</label>
                    <InputTextarea id="alamat" value={form.alamat} onChange={handleChange} rows={3} />
                  </div>

                  <div className="field col-12">
                    <label htmlFor="no_telp">No Telepon Siswa (WA)</label>
                    <InputText id="no_telp" value={form.no_telp} onChange={handleChange} keyfilter="pnum" />
                  </div>

                  <div className="field col-12">
                    <label htmlFor="foto">Foto Profil</label>
                    <FileUpload 
                      id="foto"
                      name="foto" 
                      onSelect={handleFileUpload} 
                      accept="image/*" 
                      maxFileSize={1000000} // 1MB
                      chooseLabel="Pilih Foto"
                      cancelLabel="Batal"
                      customUpload={true}
                      auto={false}
                      mode="basic" 
                    />
                  </div>
                  
                  {/* --- Data Ayah --- */}
                  <div className="col-12 mt-4">
                    <h3 className="font-semibold text-lg border-bottom-1 surface-border pb-2">Data Ayah</h3>
                  </div>
                  <div className="field col-12 md:col-6">
                    <label htmlFor="namaAyah">Nama Ayah</label>
                    <InputText id="namaAyah" value={form.namaAyah} onChange={handleChange} />
                  </div>
                  <div className="field col-12 md:col-6">
                    <label htmlFor="pekerjaanAyah">Pekerjaan Ayah</label>
                    <InputText id="pekerjaanAyah" value={form.pekerjaanAyah} onChange={handleChange} />
                  </div>
                  <div className="field col-12 md:col-6">
                    <label htmlFor="pendidikanAyah">Pendidikan Ayah</label>
                    <InputText id="pendidikanAyah" value={form.pendidikanAyah} onChange={handleChange} />
                  </div>
                   <div className="field col-12 md:col-6">
                    <label htmlFor="noTelpAyah">No Telepon Ayah</label>
                    <InputText id="noTelpAyah" value={form.noTelpAyah} onChange={handleChange} keyfilter="pnum" />
                  </div>
                  <div className="field col-12">
                    <label htmlFor="alamatAyah">Alamat Ayah</label>
                    <InputTextarea id="alamatAyah" value={form.alamatAyah} onChange={handleChange} rows={2} />
                  </div>
                 
                  {/* --- Data Ibu --- */}
                  <div className="col-12 mt-4">
                    <h3 className="font-semibold text-lg border-bottom-1 surface-border pb-2">Data Ibu</h3>
                  </div>
                  <div className="field col-12 md:col-6">
                    <label htmlFor="namaIbu">Nama Ibu</label>
                    <InputText id="namaIbu" value={form.namaIbu} onChange={handleChange} />
                  </div>
                  <div className="field col-12 md:col-6">
                    <label htmlFor="pekerjaanIbu">Pekerjaan Ibu</label>
                    <InputText id="pekerjaanIbu" value={form.pekerjaanIbu} onChange={handleChange} />
                  </div>
                  <div className="field col-12 md:col-6">
                    <label htmlFor="pendidikanIbu">Pendidikan Ibu</label>
                    <InputText id="pendidikanIbu" value={form.pendidikanIbu} onChange={handleChange} />
                  </div>
                  <div className="field col-12 md:col-6">
                    <label htmlFor="noTelpIbu">No Telepon Ibu</label>
                    <InputText id="noTelpIbu" value={form.noTelpIbu} onChange={handleChange} keyfilter="pnum" />
                  </div>
                  <div className="field col-12">
                    <label htmlFor="alamatIbu">Alamat Ibu</label>
                    <InputTextarea id="alamatIbu" value={form.alamatIbu} onChange={handleChange} rows={2} />
                  </div>

                  {/* --- Data Wali --- */}
                  <div className="col-12 mt-4">
                    <h3 className="font-semibold text-lg border-bottom-1 surface-border pb-2">Data Wali (Isi jika berbeda)</h3>
                  </div>
                  <div className="field col-12 md:col-6">
                    <label htmlFor="namaWali">Nama Wali</label>
                    <InputText id="namaWali" value={form.namaWali} onChange={handleChange} />
                  </div>
                  <div className="field col-12 md:col-6">
                    <label htmlFor="pekerjaanWali">Pekerjaan Wali</label>
                    <InputText id="pekerjaanWali" value={form.pekerjaanWali} onChange={handleChange} />
                  </div>
                  <div className="field col-12 md:col-6">
                    <label htmlFor="pendidikanWali">Pendidikan Wali</label>
                    <InputText id="pendidikanWali" value={form.pendidikanWali} onChange={handleChange} />
                  </div>
                  <div className="field col-12 md:col-6">
                    <label htmlFor="noTelpWali">No Telepon Wali</label>
                    <InputText id="noTelpWali" value={form.noTelpWali} onChange={handleChange} keyfilter="pnum" />
                  </div>
                  <div className="field col-12">
                    <label htmlFor="alamatWali">Alamat Wali</label>
                    <InputTextarea id="alamatWali" value={form.alamatWali} onChange={handleChange} rows={2} />
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

                </div>
              </form>
            </div>

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