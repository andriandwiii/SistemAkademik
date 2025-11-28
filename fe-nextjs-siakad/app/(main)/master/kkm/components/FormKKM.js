"use client";

import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag"; // ✅ import Tag

const FormKKM = ({ visible, onHide, onSave, selectedKKM, token, kkmList }) => {
  const [kodeKKM, setKodeKKM] = useState("");
  const [mapelId, setMapelId] = useState(null);
  const [tahunAjaranId, setTahunAjaranId] = useState(null); // ✅ TAMBAH
  const [kompleksitas, setKompleksitas] = useState(0);
  const [dayaDukung, setDayaDukung] = useState(0);
  const [intake, setIntake] = useState(0);
  const [keterangan, setKeterangan] = useState("");
  const [status, setStatus] = useState("Aktif");

  const [mapelOptions, setMapelOptions] = useState([]);
  const [tahunOptions, setTahunOptions] = useState([]); // ✅ TAMBAH
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Generate Kode KKM Otomatis
  const generateKodeKKM = () => {
    if (!kkmList || kkmList.length === 0) {
      return "KKM001";
    }

    const lastKKM = kkmList[0];
    const lastKode = lastKKM?.KODE_KKM || "KKM000";

    const numericPartMatch = lastKode.match(/\d+$/);
    const numericPart = numericPartMatch ? parseInt(numericPartMatch[0], 10) : 0;

    const nextNumber = numericPart + 1;
    return `KKM${nextNumber.toString().padStart(3, "0")}`;
  };

  // Hitung otomatis nilai KKM
  const hitungKKM = () => {
    if (kompleksitas && dayaDukung && intake) {
      return Math.round((Number(kompleksitas) + Number(dayaDukung) + Number(intake)) / 3);
    }
    return 0;
  };

  // Inisialisasi form
  useEffect(() => {
    const initForm = async () => {
      if (!visible) return;

      setLoadingData(true);
      await Promise.all([fetchMapel(), fetchTahunAjaran()]); // ✅ FETCH TAHUN AJARAN
      setLoadingData(false);

      if (selectedKKM) {
        // MODE EDIT
        setKodeKKM(selectedKKM.KODE_KKM || "");
        setMapelId(selectedKKM.KODE_MAPEL || null);
        setTahunAjaranId(selectedKKM.TAHUN_AJARAN_ID || null); // ✅ SET TAHUN AJARAN
        setKompleksitas(selectedKKM.KOMPLEKSITAS || 0);
        setDayaDukung(selectedKKM.DAYA_DUKUNG || 0);
        setIntake(selectedKKM.INTAKE || 0);
        setKeterangan(selectedKKM.KETERANGAN || "");
        setStatus(selectedKKM.STATUS || "Aktif");
      } else {
        // MODE TAMBAH
        const newKode = generateKodeKKM();
        setKodeKKM(newKode);
        setMapelId(null);
        setTahunAjaranId(null); // ✅ RESET TAHUN AJARAN
        setKompleksitas(0);
        setDayaDukung(0);
        setIntake(0);
        setKeterangan("");
        setStatus("Aktif");
      }
    };

    initForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, selectedKKM, token]);

  // ✅ FETCH TAHUN AJARAN
  const fetchTahunAjaran = async () => {
    try {
      const res = await fetch(`${API_URL}/master-tahun-ajaran`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];

      setTahunOptions(
        data.map((t) => ({
          label: `${t.NAMA_TAHUN_AJARAN} (${t.STATUS})`,
          value: t.TAHUN_AJARAN_ID,
        }))
      );
    } catch (err) {
      console.error("Gagal memuat data tahun ajaran:", err);
    }
  };

  // Fetch Mata Pelajaran
  const fetchMapel = async () => {
    try {
      const res = await fetch(`${API_URL}/master-mata-pelajaran`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const data = json.data || [];

      // label: "Nama Mapel (KODE)", value: KODE_MAPEL
      setMapelOptions(
        data.map((m) => ({
          label: `${m.NAMA_MAPEL} (${m.KODE_MAPEL})`,
          value: m.KODE_MAPEL,
        }))
      );
    } catch (err) {
      console.error("Gagal memuat data mapel:", err);
    }
  };

  // ----------------------------
  // Custom templates for mapel dropdown
  // ----------------------------
  const mapelOptionTemplate = (option) => {
    if (!option) return null;
    const nama = option.label?.split(" (")[0] ?? option.label;
    return (
      <div className="flex align-items-center gap-2">
        <span>{nama}</span>
        <Tag value={option.value} severity="info" className="text-xs" />
      </div>
    );
  };

  const mapelValueTemplate = (selected) => {
    if (!selected) return <span className="text-500">Pilih Mata Pelajaran</span>;
    const opt =
      typeof selected === "object" && selected !== null
        ? selected
        : mapelOptions.find((o) => o.value === selected);
    if (!opt) return <span>{selected}</span>;
    const nama = opt.label?.split(" (")[0] ?? opt.label;
    return (
      <div className="flex align-items-center gap-2">
        <span>{nama}</span>
        <Tag value={opt.value} severity="info" className="text-xs" />
      </div>
    );
  };

  // Submit Form
  const handleSubmit = async () => {
    // ✅ VALIDASI TAMBAH TAHUN AJARAN
    if (!mapelId || !tahunAjaranId || kompleksitas === 0 || dayaDukung === 0 || intake === 0) {
      return alert(
        "Mohon lengkapi semua field formulir! (Mapel, Tahun Ajaran, Kompleksitas, Daya Dukung, Intake)"
      );
    }

    const data = {
      KODE_MAPEL: mapelId,
      TAHUN_AJARAN_ID: tahunAjaranId, // ✅ KIRIM TAHUN AJARAN
      KOMPLEKSITAS: kompleksitas,
      DAYA_DUKUNG: dayaDukung,
      INTAKE: intake,
      KETERANGAN: keterangan,
      STATUS: status,
    };

    setLoading(true);
    await onSave(data);
    setLoading(false);
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
        {loadingData && (
          <div className="text-center mb-3">
            <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }}></i>
            <p>Memuat data...</p>
          </div>
        )}

        {/* Kode KKM */}
        <div className="field">
          <label htmlFor="kodeKKM">Kode KKM</label>
          <InputText id="kodeKKM" value={kodeKKM} disabled className="p-disabled" />
          {!selectedKKM && <small className="text-gray-500">Kode dibuat otomatis</small>}
        </div>

        {/* Mata Pelajaran */}
        <div className="field">
          <label htmlFor="mapel">
            Mata Pelajaran <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="mapel"
            value={mapelId}
            options={mapelOptions}
            onChange={(e) => setMapelId(e.value)}
            placeholder="Pilih Mata Pelajaran"
            filter
            showClear
            disabled={loadingData}
            itemTemplate={mapelOptionTemplate} // ✅ tampilkan nama + tag kode
            valueTemplate={mapelValueTemplate} // ✅ tampilan saat terpilih
          />
        </div>

        {/* ✅ TAHUN AJARAN */}
        <div className="field">
          <label htmlFor="tahun">
            Tahun Ajaran <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="tahun"
            value={tahunAjaranId}
            options={tahunOptions}
            onChange={(e) => setTahunAjaranId(e.value)}
            placeholder="Pilih Tahun Ajaran"
            filter
            showClear
            disabled={loadingData}
          />
          <small className="text-gray-500">KKM berlaku untuk tahun ajaran tertentu</small>
        </div>

        {/* Kompleksitas */}
        <div className="field">
          <label htmlFor="kompleksitas">Kompleksitas</label>
          <InputNumber
            id="kompleksitas"
            value={kompleksitas}
            onValueChange={(e) => setKompleksitas(e.value)}
            showButtons
            min={0}
            max={100}
            disabled={loadingData}
          />
        </div>

        {/* Daya Dukung */}
        <div className="field">
          <label htmlFor="dayaDukung">Daya Dukung</label>
          <InputNumber
            id="dayaDukung"
            value={dayaDukung}
            onValueChange={(e) => setDayaDukung(e.value)}
            showButtons
            min={0}
            max={100}
            disabled={loadingData}
          />
        </div>

        {/* Intake */}
        <div className="field">
          <label htmlFor="intake">Intake</label>
          <InputNumber
            id="intake"
            value={intake}
            onValueChange={(e) => setIntake(e.value)}
            showButtons
            min={0}
            max={100}
            disabled={loadingData}
          />
        </div>

        {/* Nilai KKM (Otomatis) */}
        <div className="field">
          <label htmlFor="kkm">Nilai KKM (Dihitung Otomatis)</label>
          <InputNumber
            id="kkm"
            value={hitungKKM()}
            mode="decimal"
            minFractionDigits={0}
            maxFractionDigits={2}
            disabled
            className="p-disabled"
          />
          <small className="text-gray-500">Rumus: (Kompleksitas + Daya Dukung + Intake) / 3</small>
        </div>

        {/* Keterangan */}
        <div className="field">
          <label htmlFor="keterangan">Keterangan</label>
          <InputText
            id="keterangan"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Contoh: Standar minimal ketuntasan"
            disabled={loadingData}
          />
        </div>

        {/* Status */}
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
            disabled={loadingData}
          />
        </div>

        {/* Footer Tombol */}
        <div className="flex justify-content-end gap-2 mt-3">
          <Button
            label="Batal"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onHide}
            disabled={loading}
          />
          <Button
            label={loading ? "Menyimpan..." : "Simpan"}
            icon="pi pi-check"
            onClick={handleSubmit}
            disabled={loading || loadingData}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default FormKKM;
