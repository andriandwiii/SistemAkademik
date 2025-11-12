"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

const FormKKM = ({ visible, onHide, onSave, selectedKKM, token }) => {
  const [kodeKKM, setKodeKKM] = useState("");
  const [mapelId, setMapelId] = useState("");
  const [kompleksitas, setKompleksitas] = useState(0);
  const [dayaDukung, setDayaDukung] = useState(0);
  const [intake, setIntake] = useState(0);
  const [keterangan, setKeterangan] = useState("");
  const [status, setStatus] = useState("Aktif");

  const [mapelList, setMapelList] = useState([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 🔹 Hitung otomatis nilai KKM
  const hitungKKM = () => {
    if (kompleksitas && dayaDukung && intake) {
      return Math.round(
        (Number(kompleksitas) + Number(dayaDukung) + Number(intake)) / 3
      );
    }
    return 0;
  };

  // 🔹 Reset / isi data saat dialog dibuka
  useEffect(() => {
    if (selectedKKM) {
      // Mode edit
      setKodeKKM(selectedKKM.KODE_KKM || "");
      setMapelId(selectedKKM.KODE_MAPEL || "");
      setKompleksitas(selectedKKM.KOMPLEKSITAS || 0);
      setDayaDukung(selectedKKM.DAYA_DUKUNG || 0);
      setIntake(selectedKKM.INTAKE || 0);
      setKeterangan(selectedKKM.KETERANGAN || "");
      setStatus(selectedKKM.STATUS || "Aktif");
    } else if (visible) {
      // Mode tambah
      setKodeKKM(""); // dikosongkan, backend yang buat
      setMapelId("");
      setKompleksitas(0);
      setDayaDukung(0);
      setIntake(0);
      setKeterangan("");
      setStatus("Aktif");
    }
  }, [selectedKKM, visible]);

  // 🔹 Ambil daftar mata pelajaran
  useEffect(() => {
    if (token) fetchMapel();
  }, [token]);

  const fetchMapel = async () => {
    try {
      const res = await fetch(`${API_URL}/master-mata-pelajaran`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setMapelList(json.data || []);
    } catch (err) {
      console.error("Gagal memuat data mapel:", err);
    }
  };

  // 🔹 Simpan data
  const handleSubmit = () => {
    const data = {
      // ❌ Jangan kirim kodeKKM untuk tambah data (backend auto)
      ...(selectedKKM && { KODE_KKM: kodeKKM }),
      KODE_MAPEL: mapelId,
      KOMPLEKSITAS: kompleksitas,
      DAYA_DUKUNG: dayaDukung,
      INTAKE: intake,
      KETERANGAN: keterangan,
      STATUS: status,
    };
    onSave(data);
  };

  return (
    <Dialog
      header={selectedKKM ? "Edit Data KKM" : "Tambah Data KKM"}
      visible={visible}
      style={{ width: "35vw" }}
      modal
      onHide={onHide}
    >
      <div className="p-fluid">
        {/* 🔹 KODE KKM (readonly / otomatis) */}
        <div className="field">
          <label htmlFor="kodeKKM">Kode KKM (Otomatis)</label>
          <InputText
            id="kodeKKM"
            value={kodeKKM}
            placeholder="Akan dibuat otomatis"
            disabled
          />
        </div>

        {/* 🔹 MATA PELAJARAN */}
        <div className="field">
          <label htmlFor="mapel">Mata Pelajaran</label>
          <Dropdown
            id="mapel"
            value={mapelId}
            options={mapelList.map((m) => ({
              label: m.NAMA_MAPEL,
              value: m.KODE_MAPEL,
            }))}
            onChange={(e) => setMapelId(e.value)}
            placeholder="Pilih Mata Pelajaran"
            filter
          />
        </div>

        {/* 🔹 KOMPLEKSITAS */}
        <div className="field">
          <label htmlFor="kompleksitas">Kompleksitas</label>
          <InputNumber
            id="kompleksitas"
            value={kompleksitas}
            onValueChange={(e) => setKompleksitas(e.value)}
            showButtons
            min={0}
            max={100}
          />
        </div>

        {/* 🔹 DAYA DUKUNG */}
        <div className="field">
          <label htmlFor="dayaDukung">Daya Dukung</label>
          <InputNumber
            id="dayaDukung"
            value={dayaDukung}
            onValueChange={(e) => setDayaDukung(e.value)}
            showButtons
            min={0}
            max={100}
          />
        </div>

        {/* 🔹 INTAKE */}
        <div className="field">
          <label htmlFor="intake">Intake</label>
          <InputNumber
            id="intake"
            value={intake}
            onValueChange={(e) => setIntake(e.value)}
            showButtons
            min={0}
            max={100}
          />
        </div>

        {/* 🔹 NILAI KKM OTOMATIS */}
        <div className="field">
          <label htmlFor="kkm">Nilai KKM (otomatis dihitung)</label>
          <InputNumber
            id="kkm"
            value={hitungKKM()}
            mode="decimal"
            minFractionDigits={0}
            maxFractionDigits={2}
            disabled
          />
        </div>

        {/* 🔹 KETERANGAN */}
        <div className="field">
          <label htmlFor="keterangan">Keterangan</label>
          <InputText
            id="keterangan"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Contoh: Standar minimal ketuntasan"
          />
        </div>

        {/* 🔹 STATUS */}
        <div className="field">
          <label htmlFor="status">Status</label>
          <Dropdown
            id="status"
            value={status}
            options={[
              { label: "Aktif", value: "Aktif" },
              { label: "Tidak Aktif", value: "Tidak Aktif" },
            ]}
            onChange={(e) => setStatus(e.value)}
            placeholder="Pilih Status"
          />
        </div>

        {/* 🔹 TOMBOL */}
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

export default FormKKM;
