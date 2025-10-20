"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const FormGedung = ({ visible, onHide, onSave, selectedGedung }) => {
  const [namaGedung, setNamaGedung] = useState("");
  const [lokasi, setLokasi] = useState("");

  useEffect(() => {
    if (selectedGedung) {
      setNamaGedung(selectedGedung.NAMA_GEDUNG || "");
      setLokasi(selectedGedung.LOKASI || "");
    } else {
      setNamaGedung("");
      setLokasi("");
    }
  }, [selectedGedung]);

  const handleSubmit = () => {
    const data = {
      NAMA_GEDUNG: namaGedung, 
      LOKASI: lokasi           
    };
    onSave(data);
  };

  return (
    <Dialog
      header={selectedGedung ? "Edit Gedung" : "Tambah Gedung"}
      visible={visible}
      style={{ width: "30vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        <div className="field">
          <label htmlFor="namaGedung">Nama Gedung</label>
          <InputText
            id="namaGedung"
            value={namaGedung}
            onChange={(e) => setNamaGedung(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="lokasi">Lokasi</label>
          <InputText
            id="lokasi"
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
          />
        </div>
        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            label="Batal"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onHide}
          />
          <Button
            label="Simpan"
            icon="pi pi-check"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormGedung;
