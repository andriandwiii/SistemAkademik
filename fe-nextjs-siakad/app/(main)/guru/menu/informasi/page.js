"use client";

import { useState, useEffect } from "react";
import { DataView } from "primereact/dataview";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Dialog } from "primereact/dialog";

export default function InformasiPage() {
  const [informasi, setInformasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/master-infosekolah`);
      const json = await res.json();
      setInformasi(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverity = (kat) => {
    switch (kat) {
      case "Akademik": return "info";
      case "Ekstrakurikuler": return "success";
      case "Prestasi": return "warning";
      case "Umum": return "danger";
      default: return "secondary";
    }
  };

  const itemTemplate = (item) => {
    return (
      <div className="col-12 p-2">
        {/* KOTAK DIBUAT SLIM (HORIZONTAL STYLE) */}
        <div 
          className="flex align-items-center bg-white border-round-xl p-3 cursor-pointer hover:surface-100 transition-all border-1 border-100 shadow-sm hover:shadow-2"
          onClick={() => setSelectedDetail(item)}
        >
          {/* Tanggal Box - Kecil & Minimalis */}
          <div className="flex flex-column align-items-center justify-content-center border-right-1 border-200 pr-3 mr-4 text-center" style={{ width: '80px' }}>
             <span className="text-2xl font-bold text-900">{new Date(item.TANGGAL).getDate()}</span>
             <span className="text-xs uppercase text-500 font-semibold">{new Date(item.TANGGAL).toLocaleDateString("id-ID", { month: 'short' })}</span>
          </div>

          {/* Konten Utama */}
          <div className="flex-grow-1 overflow-hidden">
            <div className="flex align-items-center gap-2 mb-1">
               <span className={`w-0-5rem h-0-5rem border-circle bg-${getSeverity(item.KATEGORI)}-500`}></span>
               <span className="text-xs font-bold text-500 uppercase tracking-widest">{item.KATEGORI}</span>
            </div>
            <h3 className="m-0 text-900 font-semibold text-lg white-space-nowrap overflow-hidden text-overflow-ellipsis">
              {item.JUDUL}
            </h3>
            <p className="m-0 text-500 text-sm white-space-nowrap overflow-hidden text-overflow-ellipsis mt-1">
              {item.DESKRIPSI}
            </p>
          </div>

          {/* Action - Panah Kecil */}
          <div className="ml-3 hidden md:block">
             <i className="pi pi-chevron-right text-300"></i>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="surface-50 min-h-screen">
      {/* Navbar Formal & Kecil */}
      <nav className="bg-white border-bottom-1 border-200 px-4 md:px-6 py-2 flex justify-content-between align-items-center sticky top-0 z-5">
        <span className="text-xs font-bold text-500 uppercase tracking-widest">Mading Digital</span>
        <Button icon="pi pi-sync" rounded text severity="secondary" size="small" onClick={fetchData} loading={loading} />
      </nav>

      <div className="max-w-screen-md mx-auto py-5 px-4">
        <div className="mb-4">
            <h1 className="text-2xl font-bold text-900 m-0">Pengumuman</h1>
            <p className="text-500 text-sm m-0">Update berita sekolah terbaru hari ini.</p>
        </div>

        {loading ? (
          <div className="flex justify-content-center py-8"><ProgressSpinner style={{width: '30px', height: '30px'}} /></div>
        ) : (
          <DataView value={informasi} itemTemplate={itemTemplate} rows={10} paginator className="bg-transparent" />
        )}
      </div>

      {/* 🔹 POPUP DETAIL - CLEAN ARTICLE STYLE 🔹 */}
      <Dialog 
        visible={!!selectedDetail} 
        onHide={() => setSelectedDetail(null)}
        style={{ width: '95vw', maxWidth: '550px' }}
        modal
        dismissableMask
        showHeader={false}
        contentStyle={{ padding: '0', borderRadius: '15px' }}
      >
        {selectedDetail && (
          <div className="p-4 md:p-6 bg-white">
            <div className="flex justify-content-between align-items-center mb-4">
                <Tag value={selectedDetail.KATEGORI} severity={getSeverity(selectedDetail.KATEGORI)} className="text-xs" />
                <Button icon="pi pi-times" rounded text severity="secondary" onClick={() => setSelectedDetail(null)} />
            </div>

            <span className="text-sm text-500 font-medium mb-2 block">
                {new Date(selectedDetail.TANGGAL).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <h1 className="text-900 text-2xl font-bold mt-0 mb-4 line-height-3">
                {selectedDetail.JUDUL}
            </h1>
            
            <div className="surface-100 p-3 border-round-lg mb-4 text-600 text-sm line-height-3 italic border-left-3 border-primary">
                Ringkasan: {selectedDetail.DESKRIPSI.substring(0, 80)}...
            </div>

            <div className="text-800 line-height-4 text-base text-justify white-space-pre-line">
                {selectedDetail.DESKRIPSI}
            </div>

            <div className="mt-6">
                <Button label="Kembali ke Beranda" icon="pi pi-arrow-left" className="p-button-outlined w-full p-button-sm border-round-lg" onClick={() => setSelectedDetail(null)} />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}