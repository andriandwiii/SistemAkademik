"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";

const FormMapel = ({ visible, onHide, onSave, selectedMapel }) => {
  const [kodeMapel, setKodeMapel] = useState("");
  const [namaMapel, setNamaMapel] = useState("");
  const [kategori, setKategori] = useState("Wajib");
  const [deskripsi, setDeskripsi] = useState("");
  const [status, setStatus] = useState("Aktif");

  useEffect(() => {
    if (selectedMapel) {
      setKodeMapel(selectedMapel.KODE_MAPEL || "");
      setNamaMapel(selectedMapel.NAMA_MAPEL || "");
      setKategori(selectedMapel.KATEGORI || "Wajib");
      setDeskripsi(selectedMapel.DESKRIPSI || "");
      setStatus(selectedMapel.STATUS || "Aktif");
    } else {
      setKodeMapel("");
      setNamaMapel("");
      setKategori("Wajib");
      setDeskripsi("");
      setStatus("Aktif");
    }
  }, [selectedMapel, visible]);

  const handleSubmit = () => {
    if (!kodeMapel || !namaMapel || !kategori) return alert("Lengkapi semua field wajib!");
    onSave({ KODE_MAPEL: kodeMapel, NAMA_MAPEL: namaMapel, KATEGORI: kategori, DESKRIPSI: deskripsi, STATUS: status });
  };

  return (
    <Dialog
      header={selectedMapel ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
      visible={visible}
      style={{ width: "40vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field">
          <label htmlFor="kodeMapel">Kode Mapel</label>
          <InputText
            id="kodeMapel"
            value={kodeMapel}
            onChange={(e) => setKodeMapel(e.target.value)}
            placeholder="Contoh: BIO-01"
          />
        </div>

        <div className="field">
          <label htmlFor="namaMapel">Nama Mapel</label>
          <InputText
            id="namaMapel"
            value={namaMapel}
            onChange={(e) => setNamaMapel(e.target.value)}
            placeholder="Contoh: Biologi"
          />
        </div>

        <div className="field">
          <label htmlFor="kategori">Kategori</label>
          <Dropdown
            id="kategori"
            value={kategori}
            options={["Wajib", "Peminatan", "Muatan Lokal"].map((k) => ({ label: k, value: k }))}
            onChange={(e) => setKategori(e.value)}
            placeholder="Pilih Kategori"
          />
        </div>

        <div className="field">
          <label htmlFor="deskripsi">Deskripsi</label>
          <InputTextarea
            id="deskripsi"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            rows={3}
            placeholder="Deskripsi mata pelajaran (opsional)"
          />
        </div>

        <div className="field">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            value={status}
            options={["Aktif", "Tidak Aktif"].map((s) => ({ label: s, value: s }))}
            onChange={(e) => setStatus(e.value)}
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

export default FormMapel;