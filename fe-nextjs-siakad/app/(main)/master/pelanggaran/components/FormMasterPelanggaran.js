"use client";

import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const FormMasterPelanggaran = ({ visible, onHide, onSave, selectedPelanggaran }) => {
  const [kodePelanggaran, setKodePelanggaran] = useState("");
  const [namaPelanggaran, setNamaPelanggaran] = useState("");
  const [kategori, setKategori] = useState("RINGAN");
  const [bobotPoin, setBobotPoin] = useState(0);
  const [tindakanDefault, setTindakanDefault] = useState("");

  const kategoriOptions = [
    { label: "RINGAN", value: "RINGAN" },
    { label: "SEDANG", value: "SEDANG" },
    { label: "BERAT", value: "BERAT" },
    { label: "SANGAT BERAT", value: "SANGAT BERAT" },
  ];

  useEffect(() => {
    if (visible) {
      if (selectedPelanggaran) {
        setKodePelanggaran(selectedPelanggaran.KODE_PELANGGARAN || "");
        setNamaPelanggaran(selectedPelanggaran.NAMA_PELANGGARAN || "");
        setKategori(selectedPelanggaran.KATEGORI || "RINGAN");
        setBobotPoin(selectedPelanggaran.BOBOT_POIN || 0);
        setTindakanDefault(selectedPelanggaran.TINDAKAN_DEFAULT || "");
      } else {
        setKodePelanggaran("");
        setNamaPelanggaran("");
        setKategori("RINGAN");
        setBobotPoin(0);
        setTindakanDefault("");
      }
    }
  }, [visible, selectedPelanggaran]);

  const handleSubmit = () => {
    // Memastikan field wajib tidak kosong agar tidak kena Error 400
    if (!kodePelanggaran || !namaPelanggaran) {
      alert("Kode dan Nama wajib diisi");
      return;
    }

    const payload = {
      KODE_PELANGGARAN: kodePelanggaran,
      NAMA_PELANGGARAN: namaPelanggaran,
      KATEGORI: kategori,
      BOBOT_POIN: Number(bobotPoin), // Pastikan formatnya angka (Integer)
      TINDAKAN_DEFAULT: tindakanDefault,
    };
    
    onSave(payload);
  };

  return (
    <Dialog
      header={selectedPelanggaran ? "Edit Pelanggaran" : "Tambah Pelanggaran"}
      visible={visible}
      style={{ width: "400px" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field mb-3">
          <label className="font-bold">Kode Pelanggaran</label>
          <InputText
            value={kodePelanggaran}
            onChange={(e) => setKodePelanggaran(e.target.value)}
            placeholder="P00x"
            disabled={!!selectedPelanggaran} // Kode biasanya unik, tidak boleh diedit
          />
        </div>

        <div className="field mb-3">
          <label className="font-bold">Nama Pelanggaran</label>
          <InputText
            value={namaPelanggaran}
            onChange={(e) => setNamaPelanggaran(e.target.value)}
          />
        </div>

        <div className="field mb-3">
          <label className="font-bold">Kategori</label>
          <Dropdown
            value={kategori}
            options={kategoriOptions}
            onChange={(e) => setKategori(e.value)}
          />
        </div>

        <div className="field mb-3">
          <label className="font-bold">Bobot Poin</label>
          <InputNumber
            value={bobotPoin}
            onValueChange={(e) => setBobotPoin(e.value)}
            min={0}
            showButtons
          />
        </div>

        <div className="field mb-3">
          <label className="font-bold">Tindakan Default</label>
          <InputText
            value={tindakanDefault}
            onChange={(e) => setTindakanDefault(e.target.value)}
          />
        </div>

        <div className="flex justify-content-end gap-2 mt-4">
          <Button label="Batal" icon="pi pi-times" severity="secondary" text onClick={onHide} />
          <Button label="Simpan" icon="pi pi-check" onClick={handleSubmit} />
        </div>
      </div>
    </Dialog>
  );
};

export default FormMasterPelanggaran;