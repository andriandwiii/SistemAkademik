"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";

export default function FormMasterUjian({ visible, onHide, onSave, selectedUjian, jenisUjianList }) {
  const [kodeUjian, setKodeUjian] = useState("");
  const [metode, setMetode] = useState("CBT");
  const [durasi, setDurasi] = useState(60);
  const [acakSoal, setAcakSoal] = useState(false);
  const [acakJawaban, setAcakJawaban] = useState(true);
  const [status, setStatus] = useState("Aktif");

  const metodeOptions = [
    { label: "CBT", value: "CBT" },
    { label: "PBT", value: "PBT" },
  ];
  const statusOptions = [
    { label: "Aktif", value: "Aktif" },
    { label: "Tidak Aktif", value: "Tidak Aktif" },
  ];

  useEffect(() => {
    if (selectedUjian) {
      setKodeUjian(selectedUjian.KODE_UJIAN || "");
      setMetode(selectedUjian.METODE || "CBT");
      setDurasi(selectedUjian.DURASI || 60);
      setAcakSoal(selectedUjian.ACAK_SOAL || false);
      setAcakJawaban(selectedUjian.ACAK_JAWABAN || true);
      setStatus(selectedUjian.STATUS || "Aktif");
    } else clearForm();
  }, [selectedUjian]);

  const clearForm = () => {
    setKodeUjian("");
    setMetode("CBT");
    setDurasi(60);
    setAcakSoal(false);
    setAcakJawaban(true);
    setStatus("Aktif");
  };

  const handleSubmit = () => {
    if (!kodeUjian) return alert("Kode ujian wajib dipilih");
    if (!durasi || durasi <= 0) return alert("Durasi harus lebih dari 0");

    onSave({
      KODE_UJIAN: kodeUjian,
      METODE: metode,
      DURASI: durasi,
      ACAK_SOAL: acakSoal,
      ACAK_JAWABAN: acakJawaban,
      STATUS: status,
    });
    clearForm();
  };

  return (
    <Dialog
      visible={visible}
      header={selectedUjian ? "Edit Ujian" : "Tambah Ujian"}
      style={{ width: "35vw" }}
      modal
      onHide={() => { clearForm(); onHide(); }}
    >
      <div className="p-fluid">
        <div className="field">
          <label>Kode Ujian</label>
          <Dropdown
            value={kodeUjian}
            options={jenisUjianList}
            optionLabel="KODE_UJIAN"
            optionValue="KODE_UJIAN"
            placeholder="Pilih jenis ujian"
            onChange={(e) => setKodeUjian(e.value)}
          />
        </div>

        <div className="field">
          <label>Metode</label>
          <Dropdown
            value={metode}
            options={metodeOptions}
            onChange={(e) => setMetode(e.value)}
          />
        </div>

        <div className="field">
          <label>Durasi (menit)</label>
          <InputNumber value={durasi} onValueChange={(e) => setDurasi(e.value)} min={1} />
        </div>

        <div className="field-checkbox">
          <Checkbox inputId="acakSoal" checked={acakSoal} onChange={(e) => setAcakSoal(e.checked)} />
          <label htmlFor="acakSoal">Acak Soal</label>
        </div>

        <div className="field-checkbox">
          <Checkbox inputId="acakJawaban" checked={acakJawaban} onChange={(e) => setAcakJawaban(e.checked)} />
          <label htmlFor="acakJawaban">Acak Jawaban</label>
        </div>

        <div className="field">
          <label>Status</label>
          <Dropdown value={status} options={statusOptions} onChange={(e) => setStatus(e.value)} />
        </div>

        <div className="flex justify-content-end gap-2 mt-3">
          <Button label="Batal" icon="pi pi-times" className="p-button-text" onClick={() => { clearForm(); onHide(); }} />
          <Button label="Simpan" icon="pi pi-check" onClick={handleSubmit} />
        </div>
      </div>
    </Dialog>
  );
}
