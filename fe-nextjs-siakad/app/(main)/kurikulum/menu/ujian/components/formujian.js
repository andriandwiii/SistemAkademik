"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";

const statusOptions = [
  { label: "Draft", value: "DRAFT" },
  { label: "Dibuka", value: "BUKA" },
  { label: "Dikunci", value: "KUNCI" },
];

const FormUjian = ({
  visible,
  onHide,
  onSave,
  selectedItem,
  kelasOptions,
  mapelOptions,
  jenisUjianOptions,
  guruOptions,
}) => {
  const [form, setForm] = useState({
    KELAS_ID: null,
    MAPEL_ID: null,
    GURU_ID: null,
    JENIS_UJIAN: null,
    NAMA_UJIAN: "",
    TANGGAL: null,
    JAM_MULAI: "",
    JAM_SELESAI: "",
    STATUS: "DRAFT",
  });

  useEffect(() => {
    if (selectedItem) {
      setForm({
        ...selectedItem,
        TANGGAL: selectedItem.TANGGAL
          ? new Date(selectedItem.TANGGAL)
          : null,
      });
    }
  }, [selectedItem, visible]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.KELAS_ID || !form.MAPEL_ID || !form.JENIS_UJIAN || !form.TANGGAL) {
      alert("Lengkapi data wajib!");
      return;
    }
    onSave(form);
  };

  return (
    <Dialog
      header={selectedItem ? "Edit Ujian" : "Tambah Ujian"}
      visible={visible}
      style={{ width: "40vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid grid">
        <div className="col-6 field">
          <label>Kelas</label>
          <Dropdown
            value={form.KELAS_ID}
            options={kelasOptions}
            onChange={(e) => handleChange("KELAS_ID", e.value)}
            placeholder="Pilih Kelas"
          />
        </div>

        <div className="col-6 field">
          <label>Mata Pelajaran</label>
          <Dropdown
            value={form.MAPEL_ID}
            options={mapelOptions}
            onChange={(e) => handleChange("MAPEL_ID", e.value)}
            placeholder="Pilih Mapel"
          />
        </div>

        <div className="col-6 field">
          <label>Jenis Ujian</label>
          <Dropdown
            value={form.JENIS_UJIAN}
            options={jenisUjianOptions}
            onChange={(e) => handleChange("JENIS_UJIAN", e.value)}
          />
        </div>

        <div className="col-6 field">
          <label>Pengawas</label>
          <Dropdown
            value={form.GURU_ID}
            options={guruOptions}
            onChange={(e) => handleChange("GURU_ID", e.value)}
            placeholder="Pilih Guru"
          />
        </div>

        <div className="col-12 field">
          <label>Nama Ujian</label>
          <InputText
            value={form.NAMA_UJIAN}
            onChange={(e) => handleChange("NAMA_UJIAN", e.target.value)}
          />
        </div>

        <div className="col-6 field">
          <label>Tanggal</label>
          <Calendar
            value={form.TANGGAL}
            onChange={(e) => handleChange("TANGGAL", e.value)}
            showIcon
          />
        </div>

        <div className="col-3 field">
          <label>Jam Mulai</label>
          <InputText
            value={form.JAM_MULAI}
            onChange={(e) => handleChange("JAM_MULAI", e.target.value)}
          />
        </div>

        <div className="col-3 field">
          <label>Jam Selesai</label>
          <InputText
            value={form.JAM_SELESAI}
            onChange={(e) => handleChange("JAM_SELESAI", e.target.value)}
          />
        </div>

        <div className="col-6 field">
          <label>Status</label>
          <Dropdown
            value={form.STATUS}
            options={statusOptions}
            onChange={(e) => handleChange("STATUS", e.value)}
          />
        </div>
      </div>

      <div className="flex justify-content-end gap-2 mt-3">
        <Button label="Batal" severity="secondary" onClick={onHide} />
        <Button label="Simpan" icon="pi pi-save" onClick={handleSubmit} />
      </div>
    </Dialog>
  );
};

export default FormUjian;
