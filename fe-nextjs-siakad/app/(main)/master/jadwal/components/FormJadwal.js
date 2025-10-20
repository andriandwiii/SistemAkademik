"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const FormJadwal = ({
  visible,
  onHide,
  onSave,
  selectedItem,
  kelasOptions,
  mapelKelasOptions,
  hariOptions,
}) => {
  const [formData, setFormData] = useState({
    KELAS_ID: null,
    MAPEL_KELAS_ID: null,
    HARI_ID: null,
    JAM_MULAI: "",
    JAM_SELESAI: "",
  });

  // Set data saat edit atau reset saat tambah
  useEffect(() => {
    if (selectedItem) {
      setFormData({
        KELAS_ID: selectedItem.KELAS_ID || null,
        MAPEL_KELAS_ID: selectedItem.MAPEL_KELAS_ID || null,
        HARI_ID: selectedItem.HARI_ID || null,
        JAM_MULAI: selectedItem.JAM_MULAI || "",
        JAM_SELESAI: selectedItem.JAM_SELESAI || "",
      });
    } else {
      setFormData({
        KELAS_ID: null,
        MAPEL_KELAS_ID: null,
        HARI_ID: null,
        JAM_MULAI: "",
        JAM_SELESAI: "",
      });
    }
  }, [selectedItem, visible]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.KELAS_ID || !formData.MAPEL_KELAS_ID || !formData.HARI_ID || !formData.JAM_MULAI || !formData.JAM_SELESAI) {
      return alert("Lengkapi semua field!");
    }
    onSave(formData);
  };

  return (
    <Dialog
      header={selectedItem ? "Edit Jadwal" : "Tambah Jadwal"}
      visible={visible}
      style={{ width: "30vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field">
          <label htmlFor="kelas">Kelas</label>
          <Dropdown
            id="kelas"
            value={formData.KELAS_ID}
            options={kelasOptions}
            onChange={(e) => handleChange("KELAS_ID", e.value)}
            placeholder="Pilih Kelas"
          />
        </div>

        <div className="field">
          <label htmlFor="mapel">Mata Pelajaran</label>
          <Dropdown
            id="mapel"
            value={formData.MAPEL_KELAS_ID}
            options={mapelKelasOptions}
            onChange={(e) => handleChange("MAPEL_KELAS_ID", e.value)}
            placeholder="Pilih Mata Pelajaran"
          />
        </div>

        <div className="field">
          <label htmlFor="hari">Hari</label>
          <Dropdown
            id="hari"
            value={formData.HARI_ID}
            options={hariOptions}
            onChange={(e) => handleChange("HARI_ID", e.value)}
            placeholder="Pilih Hari"
          />
        </div>

        <div className="field">
          <label htmlFor="jam_mulai">Jam Mulai</label>
          <InputText
            id="jam_mulai"
            value={formData.JAM_MULAI}
            onChange={(e) => handleChange("JAM_MULAI", e.target.value)}
            placeholder="Contoh: 07:00"
          />
        </div>

        <div className="field">
          <label htmlFor="jam_selesai">Jam Selesai</label>
          <InputText
            id="jam_selesai"
            value={formData.JAM_SELESAI}
            onChange={(e) => handleChange("JAM_SELESAI", e.target.value)}
            placeholder="Contoh: 08:30"
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

export default FormJadwal;
