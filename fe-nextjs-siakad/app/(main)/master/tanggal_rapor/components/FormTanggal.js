"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";

export default function FormTanggal({ visible, onHide, selectedData, onSave }) {
  const [formData, setFormData] = useState({
    SEMESTER: "",
    SEMESTER_KE: null,
    TEMPAT_CETAK: "",
    TANGGAL_CETAK: null,
    TULISAN_KS: "Kepala Sekolah",
    NIP_KEPSEK_LABEL: "NIP.",
    NIP_WALAS_LABEL: "NIP.",
    TTD_VALIDASI: "Tanpa ttd Validasi"
  });

  // Fungsi untuk konversi format tanggal agar tidak error di Database
  const formatDateForDB = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Format: YYYY-MM-DD
  };

  useEffect(() => {
    if (visible) {
      if (selectedData) {
        setFormData({
          ...selectedData,
          // Ubah string dari DB menjadi objek Date agar bisa dibaca Calendar
          TANGGAL_CETAK: selectedData.TANGGAL_CETAK ? new Date(selectedData.TANGGAL_CETAK) : null
        });
      } else {
        setFormData({
          SEMESTER: "",
          SEMESTER_KE: null,
          TEMPAT_CETAK: "",
          TANGGAL_CETAK: null,
          TULISAN_KS: "Kepala Sekolah",
          NIP_KEPSEK_LABEL: "NIP.",
          NIP_WALAS_LABEL: "NIP.",
          TTD_VALIDASI: "Tanpa ttd Validasi"
        });
      }
    }
  }, [visible, selectedData]);

  const handleSubmit = () => {
    // Validasi sederhana
    if (!formData.SEMESTER || !formData.TANGGAL_CETAK) {
      alert("Semester dan Tanggal Cetak wajib diisi!");
      return;
    }

    // Kirim data yang sudah diformat tanggalnya
    const finalData = {
      ...formData,
      TANGGAL_CETAK: formatDateForDB(formData.TANGGAL_CETAK)
    };
    onSave(finalData);
  };

  const labelOptions = [
    { label: "NIP.", value: "NIP." },
    { label: "NIY.", value: "NIY." }
  ];

  const validasiOptions = [
    { label: "Tanpa ttd Validasi", value: "Tanpa ttd Validasi" },
    { label: "Dengan ttd Validasi", value: "Dengan ttd Validasi" }
  ];

  return (
    <Dialog 
      header={selectedData ? "Ubah Data Tanggal Rapor" : "Tambah Data Tanggal Cetak Rapor"} 
      visible={visible} 
      style={{ width: "550px" }} 
      onHide={onHide}
      modal
      footer={
        <div className="flex justify-content-end gap-2">
          <Button label="Batal" icon="pi pi-times" onClick={onHide} className="p-button-text p-button-secondary" />
          <Button label="Simpan Data" icon="pi pi-save" onClick={handleSubmit} severity="primary" />
        </div>
      }
    >
      <div className="flex flex-column gap-4 mt-2">
        
        {/* --- Bagian Data Utama --- */}
        <div className="grid">
          <div className="col-12 md:col-6 field flex flex-column gap-2">
            <label className="font-bold text-sm">Semester</label>
            <InputText 
              value={formData.SEMESTER} 
              onChange={(e) => setFormData({ ...formData, SEMESTER: e.target.value })} 
              placeholder="Contoh: 2024/2025 Genap"
            />
          </div>
          <div className="col-12 md:col-6 field flex flex-column gap-2">
            <label className="font-bold text-sm">Semester Ke</label>
            <InputNumber 
              value={formData.SEMESTER_KE} 
              onValueChange={(e) => setFormData({ ...formData, SEMESTER_KE: e.value })} 
              placeholder="1 atau 2"
              useGrouping={false}
            />
          </div>
        </div>

        <div className="grid">
          <div className="col-12 md:col-6 field flex flex-column gap-2">
            <label className="font-bold text-sm">Tempat Cetak</label>
            <InputText 
              value={formData.TEMPAT_CETAK} 
              onChange={(e) => setFormData({ ...formData, TEMPAT_CETAK: e.target.value })} 
              placeholder="Madiun"
            />
          </div>
          <div className="col-12 md:col-6 field flex flex-column gap-2">
            <label className="font-bold text-sm">Tanggal Cetak</label>
            <Calendar 
              value={formData.TANGGAL_CETAK} 
              onChange={(e) => setFormData({ ...formData, TANGGAL_CETAK: e.value })} 
              dateFormat="yy-mm-dd" 
              showIcon
              placeholder="Pilih Tanggal"
            />
          </div>
        </div>

        {/* --- Bagian Pengaturan Tampilan --- */}
        <div className="surface-100 p-3 border-round">
          <span className="block font-bold mb-3 text-primary">Setting Tampilan Tanda Tanggan</span>
          
          <div className="flex flex-column gap-3">
            <div className="flex flex-column gap-2">
              <label className="text-sm font-semibold">Teks Jabatan Kepala Sekolah</label>
              <InputText 
                value={formData.TULISAN_KS} 
                onChange={(e) => setFormData({ ...formData, TULISAN_KS: e.target.value })} 
              />
            </div>

            <div className="grid">
              <div className="col-6 flex flex-column gap-2">
                <label className="text-sm font-semibold">Label Kepsek (NIP/NIY)</label>
                <Dropdown 
                  value={formData.NIP_KEPSEK_LABEL} 
                  options={labelOptions} 
                  onChange={(e) => setFormData({ ...formData, NIP_KEPSEK_LABEL: e.value })} 
                />
              </div>
              <div className="col-6 flex flex-column gap-2">
                <label className="text-sm font-semibold">Label Walas (NIP/NIY)</label>
                <Dropdown 
                  value={formData.NIP_WALAS_LABEL} 
                  options={labelOptions} 
                  onChange={(e) => setFormData({ ...formData, NIP_WALAS_LABEL: e.value })} 
                />
              </div>
            </div>

            <div className="flex flex-column gap-2">
              <label className="text-sm font-semibold">Tanda Tanggan Validasi</label>
              <Dropdown 
                value={formData.TTD_VALIDASI} 
                options={validasiOptions} 
                onChange={(e) => setFormData({ ...formData, TTD_VALIDASI: e.value })} 
              />
            </div>
          </div>
        </div>

      </div>
    </Dialog>
  );
}