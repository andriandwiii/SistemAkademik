"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";

const FormTahunAjaran = ({ visible, onHide, onSave, selectedTahunAjaran }) => {
  const [tahunAjaranId, setTahunAjaranId] = useState("");
  const [namaTahunAjaran, setNamaTahunAjaran] = useState("");
  const [semester, setSemester] = useState("Ganjil");
  const [tanggalMulai, setTanggalMulai] = useState(null);
  const [tanggalSelesai, setTanggalSelesai] = useState(null);
  const [status, setStatus] = useState("Tidak Aktif");

  const semesterOptions = [
    { label: "Ganjil", value: "Ganjil" },
    { label: "Genap", value: "Genap" },
  ];

  const statusOptions = [
    { label: "Aktif", value: "Aktif" },
    { label: "Tidak Aktif", value: "Tidak Aktif" },
  ];

  useEffect(() => {
    if (selectedTahunAjaran) {
      setTahunAjaranId(selectedTahunAjaran.TAHUN_AJARAN_ID || "");
      setNamaTahunAjaran(selectedTahunAjaran.NAMA_TAHUN_AJARAN || "");
      setSemester(selectedTahunAjaran.SEMESTER || "Ganjil");
      setTanggalMulai(
        selectedTahunAjaran.TANGGAL_MULAI
          ? new Date(selectedTahunAjaran.TANGGAL_MULAI)
          : null
      );
      setTanggalSelesai(
        selectedTahunAjaran.TANGGAL_SELESAI
          ? new Date(selectedTahunAjaran.TANGGAL_SELESAI)
          : null
      );
      setStatus(selectedTahunAjaran.STATUS || "Tidak Aktif");
    } else {
      setTahunAjaranId("");
      setNamaTahunAjaran("");
      setSemester("Ganjil");
      setTanggalMulai(null);
      setTanggalSelesai(null);
      setStatus("Tidak Aktif");
    }
  }, [selectedTahunAjaran]);

  const handleSubmit = () => {
    const data = {
      TAHUN_AJARAN_ID: tahunAjaranId,
      NAMA_TAHUN_AJARAN: namaTahunAjaran,
      SEMESTER: semester,
      TANGGAL_MULAI: tanggalMulai
        ? tanggalMulai.toISOString().split("T")[0]
        : null,
      TANGGAL_SELESAI: tanggalSelesai
        ? tanggalSelesai.toISOString().split("T")[0]
        : null,
      STATUS: status,
    };
    onSave(data);
  };

  return (
    <Dialog
      header={selectedTahunAjaran ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
      visible={visible}
      style={{ width: "35vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field">
          <label htmlFor="kode">Kode Tahun Ajaran</label>
          <InputText
            id="kode"
            value={tahunAjaranId}
            onChange={(e) => setTahunAjaranId(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="nama">Nama Tahun Ajaran</label>
          <InputText
            id="nama"
            value={namaTahunAjaran}
            onChange={(e) => setNamaTahunAjaran(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="semester">Semester</label>
          <Dropdown
            id="semester"
            value={semester}
            options={semesterOptions}
            onChange={(e) => setSemester(e.value)}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="field">
            <label htmlFor="mulai">Tanggal Mulai</label>
            <Calendar
              id="mulai"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.value)}
              dateFormat="yy-mm-dd"
              className="w-full"
            />
          </div>
          <div className="field">
            <label htmlFor="selesai">Tanggal Selesai</label>
            <Calendar
              id="selesai"
              value={tanggalSelesai}
              onChange={(e) => setTanggalSelesai(e.value)}
              dateFormat="yy-mm-dd"
              className="w-full"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            value={status}
            options={statusOptions}
            onChange={(e) => setStatus(e.value)}
            className="w-full"
          />
        </div>

        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            label="Batal"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onHide}
          />
          <Button label="Simpan" icon="pi pi-check" onClick={handleSubmit} />
        </div>
      </div>
    </Dialog>
  );
};

export default FormTahunAjaran;
