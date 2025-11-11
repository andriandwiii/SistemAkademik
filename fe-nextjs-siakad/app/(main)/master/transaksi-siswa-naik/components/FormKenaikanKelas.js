// File: app/(main)/master/transaksi-siswa-naik/components/FormKenaikanKelas.js

"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const FormKenaikanKelas = ({
  visible,
  onHide,
  token,
  onSave, 
}) => {
  const [loading, setLoading] = useState(false); // Loading untuk tombol submit
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [loadingSiswa, setLoadingSiswa] = useState(false);

  // Data Master
  const [taOptions, setTaOptions] = useState([]);
  const [tingkatanOptions, setTingkatanOptions] = useState([]);
  const [jurusanOptions, setJurusanOptions] = useState([]);
  const [kelasOptions, setKelasOptions] = useState([]);
  const [taAktif, setTaAktif] = useState(null);
  
  // Data dari 'transaksiAktif'
  const [kelasSiswaMap, setKelasSiswaMap] = useState(new Map());

  // State Halaman
  const [taTujuanId, setTaTujuanId] = useState(null);
  const [pemetaan, setPemetaan] = useState([]); 
  
  // State Dialog Siswa (untuk "centang-centang")
  const [siswaDialogVisible, setSiswaDialogVisible] = useState(false);
  const [currentKelasAsal, setCurrentKelasAsal] = useState(null); 
  const [currentSiswaList, setCurrentSiswaList] = useState([]); 
  const [selectedSiswa, setSelectedSiswa] = useState([]); 

  // State untuk 3 dropdown di dialog "centang-centang"
  const [pilihanTingkatan, setPilihanTingkatan] = useState(null);
  const [pilihanJurusan, setPilihanJurusan] = useState(null);
  const [pilihanKelas, setPilihanKelas] = useState(null);

  // Helper untuk fetch data dari API
  const fetchData = async (endpoint) => {
    try {
      const res = await fetch(`${API_URL}/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Gagal fetch ${endpoint}`);
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  // 1. Fetch data master (4 tabel) saat dialog dibuka
  useEffect(() => {
    if (!visible || !token) return;

    const loadMasterData = async () => {
      setLoadingMaster(true);
      
      const [allTA, allTingkatan, allJurusan, allKelas] = await Promise.all([
        fetchData("master-tahun-ajaran"),
        fetchData("master-tingkatan"),
        fetchData("master-jurusan"),
        fetchData("master-kelas"),
      ]);

      // --- Proses Tahun Ajaran ---
      const aktif = allTA.find((ta) => ta.STATUS === "Aktif");
      setTaAktif(aktif);
      const nonAktif = allTA
        .filter((ta) => ta.STATUS === "Tidak Aktif")
        .map((ta) => ({
          label: ta.NAMA_TAHUN_AJARAN,
          value: ta.TAHUN_AJARAN_ID,
        }));
      setTaOptions(nonAktif);

      // --- Proses Opsi Tujuan (Tingkatan, Jurusan, Kelas) ---
      setTingkatanOptions(
        allTingkatan.map(t => ({ label: t.TINGKATAN, value: t.TINGKATAN_ID }))
      );
      setJurusanOptions(
        allJurusan.map(j => ({ label: j.NAMA_JURUSAN, value: j.JURUSAN_ID }))
      );
      setKelasOptions(
        allKelas.map(k => ({ label: k.KELAS_ID, value: k.KELAS_ID }))
      );
      
      setLoadingMaster(false);
    };

    loadMasterData();
  }, [visible, token]);

  // 2. Fetch siswa di tahun ajaran aktif
  useEffect(() => {
    if (!taAktif) return; 

    const loadKelasSiswa = async () => {
      setLoadingSiswa(true);
      // API 'transaksi-siswa' (getAllTransaksi) sudah difilter by TAHUN AKTIF
      const transaksiAktif = await fetchData("transaksi-siswa"); 
      
      const kMap = new Map();
      transaksiAktif.forEach((t) => {
        const kelasId = t.kelas?.KELAS_ID;
        if (!kelasId) return;

        if (!kMap.has(kelasId)) {
          kMap.set(kelasId, {
            KELAS_ID: kelasId,
            TINGKATAN_ID: t.tingkatan?.TINGKATAN_ID, // <-- Data Asal
            JURUSAN_ID: t.jurusan?.JURUSAN_ID,     // <-- Data Asal
            siswa: [],
          });
        }
        if (t.siswa && t.siswa.NIS && t.siswa.NAMA) {
          kMap.get(kelasId).siswa.push(t.siswa);
        }
      });
      setKelasSiswaMap(kMap);
      setLoadingSiswa(false);
    };

    loadKelasSiswa();
  }, [taAktif]); 

  // Daftar kelas aktif (untuk dropdown "Dari Kelas")
  const kelasAktifOptions = useMemo(() => {
    return Array.from(kelasSiswaMap.keys()).map(k => ({ label: k, value: k }));
  }, [kelasSiswaMap]);


  // === LOGIKA "CENTANG-CENTANG" (PILIH SISWA) ===
  const openSiswaDialog = (kelasId) => {
    const dataKelas = kelasSiswaMap.get(kelasId);
    if (!dataKelas) return;
    
    setCurrentKelasAsal(dataKelas);
    setCurrentSiswaList(dataKelas.siswa); 
    
    // Reset pilihan dropdown
    setPilihanTingkatan(null);
    setPilihanJurusan(null);
    setPilihanKelas(null);
    
    const existingMapNaik = pemetaan.find(p => p.dariKelas === kelasId && p.nisNaik);
    const existingMapTinggal = pemetaan.find(p => p.dariKelas === kelasId && p.nisTinggal);
    
    let siswaSudahDipilih = [];
    if (existingMapNaik) {
        siswaSudahDipilih = [...siswaSudahDipilih, ...dataKelas.siswa.filter(s => existingMapNaik.nisNaik.includes(s.NIS))];
    }
    if (existingMapTinggal) {
        siswaSudahDipilih = [...siswaSudahDipilih, ...dataKelas.siswa.filter(s => existingMapTinggal.nisTinggal.includes(s.NIS))];
    }
    
    if (siswaSudahDipilih.length > 0) {
        setSelectedSiswa(siswaSudahDipilih);
    } else {
        setSelectedSiswa(dataKelas.siswa); // Centang semua jika baru
    }
    
    setSiswaDialogVisible(true);
  };

  const handleSimpanPilihanSiswa = (action) => {
    const kelasAsalId = currentKelasAsal.KELAS_ID;
    
    const nisSelected = selectedSiswa.map(s => s.NIS);
    const nisUnselected = currentSiswaList
      .filter(s => !nisSelected.includes(s.NIS))
      .map(s => s.NIS);

    // Hapus pemetaan lama untuk kelas ini
    let newPemetaan = pemetaan.filter(p => p.dariKelas !== kelasAsalId);

    if (action === "LULUS") {
      // Luluskan semua siswa di kelas ini (tidak peduli centang)
      const semuaSiswaNIS = currentSiswaList.map(s => s.NIS);
      if (semuaSiswaNIS.length > 0) {
        newPemetaan.push({
          dariKelas: kelasAsalId,
          status: "LULUS",
        });
      }
    } else if (action === "TINGGAL") {
      // Tinggalkan HANYA siswa yang dicentang
      if (nisSelected.length > 0) {
        newPemetaan.push({
          dariKelas: kelasAsalId,
          status: "TINGGAL",
          keTingkatan: currentKelasAsal.TINGKATAN_ID,
          keJurusan: currentKelasAsal.JURUSAN_ID,
          keKelas: currentKelasAsal.KELAS_ID,
          nisTinggal: nisSelected, 
        });
      }
    } else if (action === "NAIK_KELAS") {
      // Validasi 3 dropdown
      if (!pilihanTingkatan || !pilihanJurusan || !pilihanKelas) {
        alert("Pilih Tingkatan, Jurusan, dan Kelas Tujuan!");
        return;
      }
      
      // 1. Buat data untuk siswa yang NAIK (yang dicentang)
      if (nisSelected.length > 0) {
        newPemetaan.push({
          dariKelas: kelasAsalId,
          keTingkatan: pilihanTingkatan,
          keJurusan: pilihanJurusan,
          keKelas: pilihanKelas,
          nisNaik: nisSelected,
        });
      }
      
      // 2. Buat data untuk siswa yang TINGGAL (yang tidak dicentang)
      if (nisUnselected.length > 0) {
         newPemetaan.push({
          dariKelas: kelasAsalId,
          status: "TINGGAL",
          keTingkatan: currentKelasAsal.TINGKATAN_ID,
          keJurusan: currentKelasAsal.JURUSAN_ID,
          keKelas: currentKelasAsal.KELAS_ID,
          nisTinggal: nisUnselected,
        });
      }
    }
    
    setPemetaan(newPemetaan);
    setSiswaDialogVisible(false);
    setCurrentKelasAsal(null);
    setSelectedSiswa([]);
  };

  // === SUBMIT FORM UTAMA ===
  const handleSubmit = async () => {
    if (!taTujuanId) {
      return alert("Pilih Tahun Ajaran Tujuan!");
    }
    if (pemetaan.length === 0) {
      return alert("Buat setidaknya satu pemetaan kelas!");
    }

    const dataFinal = {
      taLamaId: taAktif.TAHUN_AJARAN_ID,
      taBaruId: taTujuanId,
      pemetaan: pemetaan, 
    };
    
    setLoading(true);
    await onSave(dataFinal); 
    setLoading(false);
  };
  
  const resetForm = () => {
    setPemetaan([]);
    setTaTujuanId(null);
  }

  const handleHide = () => {
    resetForm();
    onHide();
  };
  
  const siswaDialogFooter = (
    <div>
      <Button label="Batal" icon="pi pi-times" onClick={() => setSiswaDialogVisible(false)} className="p-button-text" />
      <Button 
        label="Luluskan 1 Kelas Ini" 
        icon="pi pi-graduation-cap" 
        className="p-button-success"
        onClick={() => handleSimpanPilihanSiswa("LULUS")} 
      />
      <Button 
        label="Tinggalkan Siswa (yg dicentang)" 
        icon="pi pi-user-minus" 
        className="p-button-warning"
        onClick={() => handleSimpanPilihanSiswa("TINGGAL")} 
      />
      <Button 
        label="Naikkan Siswa (yg dicentang)" 
        icon="pi pi-user-plus" 
        className="p-button-primary"
        onClick={() => handleSimpanPilihanSiswa("NAIK_KELAS")} 
        disabled={!pilihanTingkatan || !pilihanJurusan || !pilihanKelas} 
      />
    </div>
  );
  
  const isDataLoading = loadingMaster || loadingSiswa;

  return (
    <>
      {/* === DIALOG UTAMA (KENAIKAN KELAS) === */}
      <Dialog
        header="Proses Kenaikan Kelas (Otomatis)"
        visible={visible}
        style={{ width: "60vw" }} 
        modal
        onHide={handleHide}
      >
        <div className="p-fluid">
          {isDataLoading && (
            <div className="text-center mb-3">
              <ProgressSpinner style={{ width: "40px", height: "40px" }} />
              <p>Memuat data... ({(loadingMaster ? "Master" : "Siswa")})</p>
            </div>
          )}

          {!isDataLoading && (
            <>
              <div className="grid">
                <div className="col-6">
                  <div className="field">
                    <label>Dari Tahun Ajaran (Aktif)</label>
                    <InputText
                      value={taAktif?.NAMA_TAHUN_AJARAN || "Tidak ditemukan"}
                      disabled
                    />
                  </div>
                </div>
                <div className="col-6">
                  <div className="field">
                    <label htmlFor="taTujuan">Ke Tahun Ajaran (Tujuan)</label>
                    <Dropdown
                      id="taTujuan"
                      value={taTujuanId}
                      options={taOptions}
                      onChange={(e) => setTaTujuanId(e.value)}
                      placeholder="Pilih tahun ajaran tujuan"
                      showClear
                    />
                  </div>
                </div>
              </div>
              
              <Divider />
              
              <h5 className="mt-0">Pemetaan Kelas</h5>
              <Message 
                severity="info" 
                text="Pilih kelas asal dan klik 'Pilih Siswa' untuk memetakan siswa ke kelas baru." 
                className="mb-3"
              />

              {kelasAktifOptions.length === 0 && (
                <p>Tidak ada kelas/siswa di tahun ajaran aktif.</p>
              )}

              {kelasAktifOptions.map((kelasOpt) => (
                <div className="flex justify-content-between align-items-center p-2 mb-2 border rounded" key={kelasOpt.value}>
                  <div>
                    <span className="font-bold">{kelasOpt.label}</span>
                    <small className="text-gray-500 block">
                      ({kelasSiswaMap.get(kelasOpt.value)?.siswa.length || 0} Siswa)
                    </small>
                  </div>
                  <Button 
                    label="Pilih Siswa & Tetapkan Tujuan" 
                    icon="pi pi-users" 
                    className="p-button-outlined"
                    onClick={() => openSiswaDialog(kelasOpt.value)}
                    disabled={!taTujuanId}
                  />
                </div>
              ))}
              
              <div className="flex justify-content-end gap-2 mt-5">
                <Button
                  label="Batal"
                  icon="pi pi-times"
                  className="p-button-text"
                  onClick={handleHide}
                  disabled={loading}
                />
                <Button
                  label={loading ? "Memproses..." : "Proses Kenaikan Kelas"}
                  icon="pi pi-check"
                  onClick={handleSubmit}
                  disabled={loading || !taTujuanId || pemetaan.length === 0}
                />
              </div>
            </>
          )}
        </div>
      </Dialog>
      
      {/* === DIALOG KEDUA (PILIH SISWA "CENTANG-CENTANG") === */}
      <Dialog
        header={`Pilih Siswa dari Kelas: ${currentKelasAsal?.KELAS_ID || ""}`}
        visible={siswaDialogVisible}
        style={{ width: "50vw" }}
        modal
        onHide={() => setSiswaDialogVisible(false)}
        footer={siswaDialogFooter}
      >
        <Message 
          severity="warn" 
          className="mb-3"
          text="Centang siswa yang akan diproses. Siswa yang TIDAK dicentang akan diperlakukan sebagai TINGGAL KELAS jika Anda memilih 'Naik Kelas'."
        />
        
        <p className="font-bold">Pilih Tujuan (untuk siswa yang dicentang):</p>
        <div className="grid">
            <div className="col-4 field">
                <label>Tingkatan Tujuan</label>
                <Dropdown 
                    options={tingkatanOptions}
                    value={pilihanTingkatan}
                    onChange={(e) => setPilihanTingkatan(e.value)}
                    placeholder="Pilih Tingkatan"
                    showClear
                />
            </div>
            <div className="col-4 field">
                <label>Jurusan Tujuan</label>
                <Dropdown 
                    options={jurusanOptions}
                    value={pilihanJurusan}
                    onChange={(e) => setPilihanJurusan(e.value)}
                    placeholder="Pilih Jurusan"
                    showClear
                />
            </div>
            <div className="col-4 field">
                <label>Kelas Tujuan</label>
                <Dropdown 
                    options={kelasOptions}
                    value={pilihanKelas}
                    onChange={(e) => setPilihanKelas(e.value)}
                    placeholder="Pilih Kelas"
                    filter
                    showClear
                />
            </div>
        </div>
        <Divider />
        
        <DataTable 
          value={currentSiswaList} 
          selection={selectedSiswa} 
          onSelectionChange={(e) => setSelectedSiswa(e.value)}
          dataKey="NIS"
          size="small"
          scrollable
          scrollHeight="300px" 
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
          <Column field="NIS" header="NIS"></Column>
          <Column field="NAMA" header="Nama Siswa"></Column>
        </DataTable>
      </Dialog>
    </>
  );
};

export default FormKenaikanKelas;