"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";

const FormJamPelajaran = ({ visible, onHide, onSave, selectedItem }) => {
  const [formData, setFormData] = useState({
    KODE_JP: "",
    JP_KE: 1,
    WAKTU_MULAI: null, // gunakan Date object
    WAKTU_SELESAI: null,
    DURASI: 45,
    DESKRIPSI: "Pelajaran",
  });

  useEffect(() => {
    if (selectedItem) {
      const mulai = selectedItem.WAKTU_MULAI ? new Date(`1970-01-01T${selectedItem.WAKTU_MULAI}`) : null;
      setFormData({
        KODE_JP: selectedItem.KODE_JP || "",
        JP_KE: selectedItem.JP_KE || 1,
        WAKTU_MULAI: mulai,
        WAKTU_SELESAI: mulai ? new Date(mulai.getTime() + (selectedItem.DURASI || 45) * 60000) : null,
        DURASI: selectedItem.DURASI || 45,
        DESKRIPSI: selectedItem.DESKRIPSI || "Pelajaran",
      });
    } else {
      setFormData({
        KODE_JP: "",
        JP_KE: 1,
        WAKTU_MULAI: null,
        WAKTU_SELESAI: null,
        DURASI: 45,
        DESKRIPSI: "Pelajaran",
      });
    }
  }, [selectedItem, visible]);

  // hitung WAKTU_SELESAI otomatis
  const calculateEndTime = (startTime, durasi) => {
    if (!startTime) return null;
    return new Date(startTime.getTime() + durasi * 60000);
  };

  const handleChange = (field, value) => {
    let newData = { ...formData, [field]: value };

    // jika mulai atau durasi berubah, update WAKTU_SELESAI
    if (field === "WAKTU_MULAI" || field === "DURASI") {
      newData.WAKTU_SELESAI = calculateEndTime(
        field === "WAKTU_MULAI" ? value : formData.WAKTU_MULAI,
        field === "DURASI" ? value : formData.DURASI
      );
    }

    setFormData(newData);
  };

  const handleSubmit = () => {
    if (!formData.KODE_JP || !formData.JP_KE || !formData.WAKTU_MULAI || !formData.WAKTU_SELESAI) {
      return alert("Lengkapi semua field!");
    }

    // ubah Date object ke HH:MM:SS
    const formatTime = (date) =>
      date ? date.toTimeString().split(" ")[0] : null;

    onSave({
      ...formData,
      WAKTU_MULAI: formatTime(formData.WAKTU_MULAI),
      WAKTU_SELESAI: formatTime(formData.WAKTU_SELESAI),
    });
  };

  return (
    <Dialog
      header={selectedItem ? "Edit Jam Pelajaran" : "Tambah Jam Pelajaran"}
      visible={visible}
      style={{ width: "30vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field">
          <label htmlFor="kode_jp">Kode JP</label>
          <InputText
            id="kode_jp"
            value={formData.KODE_JP}
            onChange={(e) => handleChange("KODE_JP", e.target.value)}
            placeholder="Contoh: K01"
          />
        </div>

        <div className="field">
          <label htmlFor="jp_ke">JP Ke</label>
          <InputNumber
            id="jp_ke"
            value={formData.JP_KE}
            onValueChange={(e) => handleChange("JP_KE", e.value)}
            min={1}
            showButtons
            buttonLayout="horizontal"
          />
        </div>

        <div className="field">
          <label htmlFor="waktu_mulai">Jam Mulai</label>
          <Calendar
            id="waktu_mulai"
            value={formData.WAKTU_MULAI}
            onChange={(e) => handleChange("WAKTU_MULAI", e.value)}
            timeOnly
            hourFormat="24"
            placeholder="Pilih jam mulai"
          />
        </div>

        <div className="field">
          <label htmlFor="durasi">Durasi (menit)</label>
          <InputNumber
            id="durasi"
            value={formData.DURASI}
            onValueChange={(e) => handleChange("DURASI", e.value)}
            min={1}
          />
        </div>

        <div className="field">
          <label htmlFor="waktu_selesai">Jam Selesai</label>
          <InputText
            id="waktu_selesai"
            value={formData.WAKTU_SELESAI ? formData.WAKTU_SELESAI.toTimeString().split(" ")[0] : ""}
            disabled
          />
        </div>

        <div className="field">
          <label htmlFor="deskripsi">Deskripsi</label>
          <InputText
            id="deskripsi"
            value={formData.DESKRIPSI}
            onChange={(e) => handleChange("DESKRIPSI", e.target.value)}
            placeholder="Pelajaran"
          />
        </div>

        <div className="flex justify-content-end gap-2 mt-3">
          <Button label="Batal" icon="pi pi-times" className="p-button-text" onClick={onHide} />
          <Button label="Simpan" icon="pi pi-check" onClick={handleSubmit} />
        </div>
      </div>
    </Dialog>
  );
};

export default FormJamPelajaran;
