"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Skeleton } from "primereact/skeleton";
import { Tag } from "primereact/tag";
import { Image } from "primereact/image";
import { Button } from "primereact/button";
import axios from "axios";

const AbsensiDetailDialog = ({ visible, onHide, data }) => {
  const [guruDetail, setGuruDetail] = useState(null);
  const [loadingGuru, setLoadingGuru] = useState(true);

  // Konfigurasi API
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100";

  // --- FETCH DATA GURU BY NIP ---
  useEffect(() => {
    if (data && visible) {
      setLoadingGuru(true);
      // Asumsi: Anda punya endpoint untuk ambil detail guru by NIP
      // Jika belum ada, Anda bisa buat endpoint: /api/master-guru/detail?nip=...
      // Atau sesuaikan dengan endpoint yang tersedia di backend Anda
      axios
        .get(`${API_URL}/api/master-guru/detail/${data.NIP}`) 
        .then((res) => {
          if (res.data.status === "success") {
            setGuruDetail(res.data.data);
          }
        })
        .catch((err) => {
          console.error("Gagal memuat info guru:", err);
          setGuruDetail(null);
        })
        .finally(() => setLoadingGuru(false));
    }
  }, [data, visible, API_URL]);

  // --- HELPER UNTUK GAMBAR ---
  const getImageSrc = (path) => {
    if (!path) return null;
    if (path.startsWith("data:image")) return path; // Base64
    if (path.startsWith("http")) return path; // External URL
    return `${API_URL}${path}`; // Local Upload
  };

  // --- HELPER RENDER ITEM INFO ---
  const InfoItem = ({ label, value, icon, isLink = false }) => (
    <div className="mb-3">
      <span className="text-500 text-sm font-medium block mb-1">
        {icon && <i className={`${icon} mr-1`}></i>}
        {label}
      </span>
      {isLink && value ? (
        <a 
            href={`https://www.google.com/maps/search/?api=1&query=${value}`} 
            target="_blank" 
            rel="noreferrer"
            className="text-blue-600 hover:text-blue-800 font-semibold no-underline flex align-items-center gap-1"
        >
            <i className="pi pi-map-marker"></i> {value}
        </a>
      ) : (
        <span className="text-900 font-semibold text-lg">{value || "-"}</span>
      )}
    </div>
  );

  return (
    <Dialog
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-id-card text-primary text-2xl"></i>
          <span className="font-bold text-xl">Detail Absensi Guru</span>
        </div>
      }
      visible={visible}
      style={{ width: "900px", maxWidth: "95vw" }}
      modal
      draggable={false}
      onHide={onHide}
      className="p-fluid"
      blockScroll
    >
      {data ? (
        <div className="pb-2">
          
          {/* ====== BAGIAN 1: PROFIL GURU (DARI MASTER GURU) ====== */}
          <Card className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-none shadow-2 surface-50">
            {loadingGuru ? (
              <div className="flex gap-3 align-items-center">
                <Skeleton shape="circle" size="5rem" className="mr-2"></Skeleton>
                <div style={{ flex: '1' }}>
                    <Skeleton width="100%" className="mb-2"></Skeleton>
                    <Skeleton width="75%"></Skeleton>
                </div>
              </div>
            ) : (
              <div className="grid align-items-center">
                {/* Foto Profil Guru (Bukan Foto Absen) */}
                <div className="col-12 md:col-3 text-center">
                    <div className="relative inline-block">
                        <Image
                            src={getImageSrc(guruDetail?.FOTO)}
                            alt="Profil"
                            width="100"
                            height="100"
                            className="border-circle shadow-4"
                            imageStyle={{ objectFit: 'cover', borderRadius: '50%', width: '100px', height: '100px' }}
                            onError={(e) => e.target.src = 'https://via.placeholder.com/100?text=Guru'}
                            preview
                        />
                    </div>
                </div>
                
                {/* Info Guru */}
                <div className="col-12 md:col-9">
                  <h2 className="mt-0 mb-1 text-primary">
                    {guruDetail?.NAMA || data.NAMA_GURU || "Nama Tidak Ditemukan"}
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-3 align-items-center">
                    <Tag value={data.NIP} icon="pi pi-id-card" severity="info" className="text-sm" />
                    {guruDetail?.GENDER && (
                        <Tag 
                            value={guruDetail.GENDER === 'L' ? 'Laki-laki' : 'Perempuan'} 
                            icon={guruDetail.GENDER === 'L' ? 'pi pi-mars' : 'pi pi-venus'} 
                            severity="warning" 
                            className="text-sm"
                        />
                    )}
                    {guruDetail?.NO_TELP && (
                        <span className="text-600 text-sm flex align-items-center gap-1 ml-2">
                            <i className="pi pi-phone"></i> {guruDetail.NO_TELP}
                        </span>
                    )}
                  </div>
                  
                  {/* Jabatan / Status (Opsional, jika ada di master guru) */}
                  <div className="text-600">
                    <i className="pi pi-envelope mr-1"></i> {guruDetail?.EMAIL || "-"}
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Divider align="center">
            <span className="bg-white px-3 text-700 font-bold border-1 border-300 border-round p-1">
                Data Kehadiran
            </span>
          </Divider>

          {/* ====== BAGIAN 2: DATA ABSENSI (DARI TABEL ABSENSI) ====== */}
          
          {/* Status Utama */}
          <div className="flex justify-content-between align-items-center mb-4 px-2">
             <div>
                <span className="text-500 block text-sm">Tanggal Absen</span>
                <span className="text-xl font-bold">
                    {new Date(data.TANGGAL).toLocaleDateString('id-ID', { 
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
                    })}
                </span>
             </div>
             <div className="text-right">
                <span className="text-500 block text-sm mb-1">Status</span>
                <div className="flex gap-2 justify-content-end">
                    <Tag 
                        value={data.STATUS} 
                        severity={
                            data.STATUS === 'Hadir' ? 'success' : 
                            data.STATUS === 'Sakit' ? 'warning' : 'danger'
                        } 
                        className="text-lg px-3 py-2"
                    />
                    {data.TERLAMBAT === 1 && (
                        <Tag value="TERLAMBAT" severity="danger" icon="pi pi-clock" />
                    )}
                </div>
             </div>
          </div>

          <div className="grid">
            
            {/* === KOLOM MASUK === */}
            <div className="col-12 md:col-6">
                <Card className="h-full border-top-3 border-green-500 shadow-2">
                    <div className="text-center mb-3">
                        <Tag value="ABSEN MASUK" severity="success" className="w-full text-base py-2" />
                    </div>

                    <div className="text-center mb-4">
                        <div className="text-4xl font-bold text-green-600 mb-1">
                            {data.JAM_MASUK ? data.JAM_MASUK.slice(0, 5) : "--:--"}
                        </div>
                        <small className="text-500">Waktu Masuk</small>
                    </div>

                    {/* Foto Selfie Masuk */}
                    <div className="mb-4 text-center">
                        <span className="block text-500 text-sm mb-2">Foto Bukti (Selfie)</span>
                        {data.FOTO_MASUK ? (
                            <Image 
                                src={getImageSrc(data.FOTO_MASUK)} 
                                alt="Foto Masuk" 
                                width="150" 
                                className="shadow-2 border-round"
                                preview
                            />
                        ) : (
                            <div className="surface-200 p-4 border-round text-500">
                                <i className="pi pi-image text-2xl block mb-2"></i>
                                Tidak ada foto
                            </div>
                        )}
                    </div>

                    <InfoItem label="Lokasi Masuk" value={data.LOKASI_MASUK} icon="pi pi-map" isLink={true} />
                    
                    {/* Tanda Tangan Masuk */}
                    <div className="mt-3">
                        <span className="text-500 text-sm font-medium block mb-2">Tanda Tangan</span>
                        {data.TANDA_TANGAN_MASUK ? (
                            <div className="surface-50 border-1 border-300 border-round p-2 flex justify-content-center">
                                <Image 
                                    src={data.TANDA_TANGAN_MASUK} 
                                    alt="TTD Masuk" 
                                    width="120" 
                                    preview
                                />
                            </div>
                        ) : <span className="text-400">-</span>}
                    </div>
                </Card>
            </div>

            {/* === KOLOM PULANG === */}
            <div className="col-12 md:col-6">
                <Card className="h-full border-top-3 border-blue-500 shadow-2">
                    <div className="text-center mb-3">
                        <Tag value="ABSEN PULANG" severity="info" className="w-full text-base py-2" />
                    </div>

                    <div className="text-center mb-4">
                        <div className={`text-4xl font-bold mb-1 ${data.JAM_KELUAR ? 'text-blue-600' : 'text-gray-400'}`}>
                            {data.JAM_KELUAR ? data.JAM_KELUAR.slice(0, 5) : "--:--"}
                        </div>
                        <small className="text-500">Waktu Pulang</small>
                    </div>

                    {/* Info Kosong untuk Foto (Biasanya pulang ga wajib foto, tapi kalau ada bisa ditampilkan) */}
                    <div className="mb-4 text-center p-3">
                        {/* Placeholder agar sejajar dengan kolom masuk */}
                        <div style={{ height: '100px' }} className="flex align-items-center justify-content-center text-500 font-italic">
                           Absen pulang<br/>tidak memerlukan foto
                        </div>
                    </div>

                    <InfoItem label="Lokasi Pulang" value={data.LOKASI_KELUAR} icon="pi pi-map" isLink={true} />

                    {/* Tanda Tangan Keluar */}
                    <div className="mt-3">
                        <span className="text-500 text-sm font-medium block mb-2">Tanda Tangan</span>
                        {data.TANDA_TANGAN_KELUAR && data.TANDA_TANGAN_KELUAR !== '-' ? (
                            <div className="surface-50 border-1 border-300 border-round p-2 flex justify-content-center">
                                <Image 
                                    src={data.TANDA_TANGAN_KELUAR} 
                                    alt="TTD Pulang" 
                                    width="120" 
                                    preview
                                />
                            </div>
                        ) : <span className="text-400 text-sm font-italic">Tidak ada tanda tangan</span>}
                    </div>
                </Card>
            </div>

            {/* KETERANGAN JIKA ADA */}
            {data.KETERANGAN && data.KETERANGAN !== '-' && (
                <div className="col-12 mt-2">
                    <Card className="surface-100 border-1 border-300 shadow-none">
                        <div className="flex gap-2">
                            <i className="pi pi-info-circle text-xl text-primary mt-1"></i>
                            <div>
                                <span className="font-bold block text-primary">Keterangan Tambahan:</span>
                                <p className="m-0 text-900">{data.KETERANGAN}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

          </div>

        </div>
      ) : (
        <div className="text-center py-6">
          <i className="pi pi-spin pi-spinner text-4xl text-primary mb-3"></i>
          <p className="text-600">Memuat data...</p>
        </div>
      )}
    </Dialog>
  );
};

export default AbsensiDetailDialog;