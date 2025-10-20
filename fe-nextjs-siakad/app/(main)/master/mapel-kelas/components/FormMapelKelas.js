"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const FormMapelKelas = ({ visible, onHide, onSave, selectedItem, kelasOptions, mapelOptions, guruOptions }) => {
  const [kelasId, setKelasId] = useState(null);
  const [mapelId, setMapelId] = useState(null);
  const [guruId, setGuruId] = useState(null);
  const [kodeMapel, setKodeMapel] = useState("");

  useEffect(() => {
    if (selectedItem) {
      setKelasId(selectedItem.KELAS_ID || null);
      setMapelId(selectedItem.MAPEL_ID || null);
      setGuruId(selectedItem.GURU_ID || null);
      setKodeMapel(selectedItem.KODE_MAPEL || "");
    } else {
      setKelasId(null);
      setMapelId(null);
      setGuruId(null);
      setKodeMapel("");
    }
  }, [selectedItem, visible]);

  const handleSubmit = () => {
    if (!kelasId || !mapelId || !kodeMapel) {
      return alert("Lengkapi field Kelas, Mapel, dan Kode Mapel!");
    }

    const data = {
      KELAS_ID: kelasId,
      MAPEL_ID: mapelId,
      GURU_ID: guruId,
      KODE_MAPEL: kodeMapel,
    };

    onSave(data);
  };

  return (
    <Dialog
      header={selectedItem ? "Edit Mapel-Kelas" : "Tambah Mapel-Kelas"}
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
            value={kelasId}
            options={kelasOptions}
            onChange={(e) => setKelasId(e.value)}
            placeholder="Pilih Kelas"
          />
        </div>

        <div className="field">
          <label htmlFor="mapel">Mata Pelajaran</label>
          <Dropdown
            id="mapel"
            value={mapelId}
            options={mapelOptions}
            onChange={(e) => setMapelId(e.value)}
            placeholder="Pilih Mapel"
          />
        </div>

        <div className="field">
          <label htmlFor="guru">Guru Pengampu</label>
          <Dropdown
            id="guru"
            value={guruId}
            options={guruOptions}
            onChange={(e) => setGuruId(e.value)}
            placeholder="Pilih Guru"
            showClear
          />
        </div>

        <div className="field">
          <label htmlFor="kodeMapel">Kode / Keterangan</label>
          <InputText
            id="kodeMapel"
            value={kodeMapel}
            onChange={(e) => setKodeMapel(e.target.value)}
            placeholder="Masukkan Kode/Ket"
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

export default FormMapelKelas;
