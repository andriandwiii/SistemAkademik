/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';

import ToastNotifier from '@/app/components/ToastNotifier';
import CustomDataTable from '@/app/components/DataTable';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8100';

export default function EntryNilaiPage() {
  const toastRef = useRef(null);
  const [token, setToken] = useState(null);

  // profile / guru
  const [currentUser, setCurrentUser] = useState(null);
  const [currentGuru, setCurrentGuru] = useState(null); // object dari master_guru (mengandung NIP)

  // filters (selected values)
  const [filters, setFilters] = useState({
    TAHUN_AJARAN_ID: '',
    TINGKATAN_ID: '',
    JURUSAN_ID: '',
    KELAS_ID: '',
    KODE_MAPEL: ''
  });

  // opsi yang benar-benar diampu guru
  const [opsiTahun, setOpsiTahun] = useState([]); // [{ label, value }]
  const [opsiTingkat, setOpsiTingkat] = useState([]); // [{ label, value }]
  const [opsiJurusan, setOpsiJurusan] = useState([]); // [{ label, value }]
  const [opsiKelas, setOpsiKelas] = useState([]); // [{ label, value }]
  const [opsiMapel, setOpsiMapel] = useState([]); // [{ label, value }]

  // data nilai & meta
  const [grades, setGrades] = useState([]);
  const [meta, setMeta] = useState({ kkm: 75, deskripsi_template: {}, interval_predikat: {} });

  // ui
  const [loading, setLoading] = useState(false);
  const [loadingMapel, setLoadingMapel] = useState(false); // general loading for mapel/kelas fetch
  const [loadingMapelCalc, setLoadingMapelCalc] = useState(false); // specific: calculating opsiMapel from many kelas
  const [isTableVisible, setIsTableVisible] = useState(false);

  // keep master years for iteration
  const [masterTahun, setMasterTahun] = useState([]);

  // debounce + request id refs
  const debounceRef = useRef(null);
  const mapelRequestIdRef = useRef(0);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      window.location.href = '/';
      return;
    }
    setToken(t);
    fetchUserProfile(t);
    loadMasterTahun(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const axiosWithAuth = (t) => axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${t}` } });

  /* ================== PROFILE ================== */
  const fetchUserProfile = async (t) => {
    try {
      const res = await axiosWithAuth(t).get('/auth/profile');
      if (res.data?.status === '00' && res.data.user) {
        setCurrentUser(res.data.user);
        if (res.data.user.role !== 'GURU') {
          toastRef.current?.showToast('01', 'Anda bukan guru, tidak dapat mengakses halaman ini');
          setTimeout(() => window.location.href = '/dashboard', 1200);
          return;
        }
        await fetchGuruDetailByEmail(t, res.data.user.email);
      } else {
        toastRef.current?.showToast('01', 'Gagal mengambil profil');
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Error fetch profile:', err);
      toastRef.current?.showToast('01', 'Sesi habis atau gagal memuat profil');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  };

  const fetchGuruDetailByEmail = async (t, email) => {
    try {
      const res = await axiosWithAuth(t).get('/master-guru');
      if (res.data?.status === '00') {
        const found = (res.data.data || []).find(g => g.EMAIL === email);
        if (found) {
          setCurrentGuru(found);
        } else {
          toastRef.current?.showToast('01', 'Data guru tidak ditemukan di master_guru');
        }
      }
    } catch (err) {
      console.error('Error fetch guru detail:', err);
      toastRef.current?.showToast('01', 'Gagal mengambil data guru');
    }
  };

  /* =============== LOAD MASTER TAHUN & FILTER BY GURU'S SCHEDULE =============== */
  const loadMasterTahun = async (t) => {
    try {
      const res = await axiosWithAuth(t).get('/master-tahun-ajaran');
      const years = (res.data.data || []).map(i => ({ label: i.NAMA_TAHUN_AJARAN, value: i.TAHUN_AJARAN_ID }));
      setMasterTahun(years);
    } catch (err) {
      console.error('Error load master tahun:', err);
      toastRef.current?.showToast('01', 'Gagal memuat tahun ajaran');
    }
  };

  // Filter tahun berdasarkan guru setelah currentGuru dan masterTahun tersedia
  useEffect(() => {
    if (token && currentGuru && masterTahun.length > 0) {
      filterTahunByGuru(token, currentGuru.NIP, masterTahun);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentGuru, masterTahun]);

  const filterTahunByGuru = async (t, nip, tahunList) => {
    setLoadingMapel(true);
    try {
      const allowedYears = [];
      for (const y of tahunList) {
        try {
          const r = await axiosWithAuth(t).get('/transaksi-nilai/mapel-guru', {
            params: { nip, tahunId: y.value }
          });
          if (r.data?.status === '00' && Array.isArray(r.data.data) && r.data.data.length > 0) {
            allowedYears.push(y);
          }
        } catch (e) {
          // ignore errors for that year
        }
      }
      setOpsiTahun(allowedYears);

      // Clear filters if selected year is not available
      if (filters.TAHUN_AJARAN_ID && !allowedYears.find(a => a.value === filters.TAHUN_AJARAN_ID)) {
        setFilters(prev => ({ ...prev, TAHUN_AJARAN_ID: '', KELAS_ID: '', KODE_MAPEL: '', TINGKATAN_ID: '', JURUSAN_ID: '' }));
        setOpsiMapel([]);
        setOpsiKelas([]);
        setOpsiTingkat([]);
        setOpsiJurusan([]);
        setIsTableVisible(false);
      }
    } finally {
      setLoadingMapel(false);
    }
  };

  /* ================= Load Tingkatan, Jurusan, Kelas, Mapel berdasarkan Tahun & Guru ================
     NOTE: opsiMapel computation is debounced + uses request id to ignore stale results.
  */
  useEffect(() => {
    // debounce wrapper to avoid calling heavy logic on every quick change
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      loadDataByYearAndFilters();
    }, 400); // 400 ms debounce

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.TAHUN_AJARAN_ID, filters.TINGKATAN_ID, filters.JURUSAN_ID, filters.KELAS_ID, currentGuru, token]);

  const loadDataByYearAndFilters = async () => {
    if (!token || !currentGuru || !filters.TAHUN_AJARAN_ID) {
      setOpsiTingkat([]);
      setOpsiJurusan([]);
      setOpsiKelas([]);
      setOpsiMapel([]);
      return;
    }

    setLoadingMapel(true);
    // increment request id for this run
    const reqId = ++mapelRequestIdRef.current;

    try {
      // 1) Load TINGKATAN yang diampu guru
      const rTingkat = await axiosWithAuth(token).get('/transaksi-nilai/tingkatan-guru', {
        params: { nip: currentGuru.NIP, tahunId: filters.TAHUN_AJARAN_ID }
      });
      const tingkatList = (rTingkat.data?.data || []).map(t => ({
        label: t.NAMA_TINGKATAN,
        value: t.TINGKATAN_ID
      }));
      setOpsiTingkat(tingkatList);

      // 2) Load JURUSAN yang diampu guru (filter by tingkat jika ada)
      const rJurusan = await axiosWithAuth(token).get('/transaksi-nilai/jurusan-guru', {
        params: {
          nip: currentGuru.NIP,
          tahunId: filters.TAHUN_AJARAN_ID,
          tingkatanId: filters.TINGKATAN_ID || undefined
        }
      });
      const jurusanList = (rJurusan.data?.data || []).map(j => ({
        label: j.NAMA_JURUSAN,
        value: j.JURUSAN_ID
      }));
      setOpsiJurusan(jurusanList);

      // 3) Load KELAS yang diampu guru (dengan filter tingkat & jurusan)
      const rKelas = await axiosWithAuth(token).get('/transaksi-nilai/kelas-guru', {
        params: {
          nip: currentGuru.NIP,
          tahunId: filters.TAHUN_AJARAN_ID,
          tingkatanId: filters.TINGKATAN_ID || undefined,
          jurusanId: filters.JURUSAN_ID || undefined
        }
      });
      const kelasRaw = (rKelas.data?.data || []);
      const kelasList = kelasRaw.map(k => {
        const namaKelas = typeof k.NAMA_KELAS === 'string' ? k.NAMA_KELAS : (k.NAMA_RUANG || '');
        return {
          KELAS_ID: k.KELAS_ID,
          label: `${k.KELAS_ID} | ${namaKelas}`,
          value: k.KELAS_ID
        };
      });
      setOpsiKelas(kelasList);

      // 4) Load MAPEL yang diampu guru (semua mapel guru untuk tahun itu)
      const rMapelGuru = await axiosWithAuth(token).get('/transaksi-nilai/mapel-guru', {
        params: { nip: currentGuru.NIP, tahunId: filters.TAHUN_AJARAN_ID }
      });
      const teacherMapelArr = (rMapelGuru.data?.data || []);

      // NEW: compute allowedMapelCodes using kelas filter(s)
      // show special loading spinner when computing mapel across many kelas
      setLoadingMapelCalc(true);
      let allowedMapelCodes = new Set();

      try {
        if (filters.KELAS_ID) {
          // specific kelas -> single quick call to mapel endpoint
          const rMapelByKelas = await axiosWithAuth(token).get('/transaksi-nilai/mapel', {
            params: { kelasId: filters.KELAS_ID, tahunId: filters.TAHUN_AJARAN_ID }
          });
          (rMapelByKelas.data?.data || []).forEach(m => {
            const kode = m.KODE_MAPEL || m.KODE || (m.value ? String(m.value) : null);
            if (kode) allowedMapelCodes.add(String(kode));
          });
        } else if (filters.TINGKATAN_ID || filters.JURUSAN_ID) {
          // multiple kelas -> potentially many calls; use Promise.all but guard with reqId
          const kelasIds = kelasRaw.map(k => k.KELAS_ID).filter(Boolean);
          if (kelasIds.length > 0) {
            // to avoid overloading, chunk requests if very many (optional improvement)
            const promises = kelasIds.map(kid =>
              axiosWithAuth(token).get('/transaksi-nilai/mapel', {
                params: { kelasId: kid, tahunId: filters.TAHUN_AJARAN_ID }
              }).then(r => r.data?.data || []).catch(() => [])
            );
            const results = await Promise.all(promises);

            // ignore stale if a newer request started
            if (reqId !== mapelRequestIdRef.current) {
              // stale -> bail out
              return;
            }

            results.flat().forEach(m => {
              const kode = m.KODE_MAPEL || m.KODE || (m.value ? String(m.value) : null);
              if (kode) allowedMapelCodes.add(String(kode));
            });
          }
        } else {
          // no kelas/tingkat/jurusan filter -> allow all teacher mapel
          teacherMapelArr.forEach(m => {
            const kode = m.KODE_MAPEL || m.KODE || (m.value ? String(m.value) : null);
            if (kode) allowedMapelCodes.add(String(kode));
          });
        }
      } catch (e) {
        console.warn('gagal ambil mapel by kelas/tingkat/jurusan', e);
      } finally {
        setLoadingMapelCalc(false);
      }

      // ignore if stale
      if (reqId !== mapelRequestIdRef.current) {
        return;
      }

      // Intersect teacherMapelArr with allowedMapelCodes
      let finalTeacherMapel = [];
      if (allowedMapelCodes.size === 0) {
        finalTeacherMapel = [];
      } else {
        finalTeacherMapel = teacherMapelArr.filter(m => {
          const kode = (m.KODE_MAPEL || m.KODE || (m.value ? String(m.value) : '') || '').toString();
          return allowedMapelCodes.has(String(kode));
        });
      }

      // Build opsiMapel as label "Nama (KODE)" value = kode
      const mapelList = finalTeacherMapel.map(m => {
        const nama = m?.NAMA_MAPEL || (m?.mata_pelajaran && m.mata_pelajaran.NAMA_MAPEL) || 'Unknown';
        const kode = m?.KODE_MAPEL || (m?.mata_pelajaran && m.mata_pelajaran.KODE_MAPEL) || String(m?.value || '');
        return {
          label: `${nama} (${kode})`,
          value: String(kode)
        };
      });

      // final guard against stale
      if (reqId === mapelRequestIdRef.current) {
        setOpsiMapel(mapelList);
        // clear KODE_MAPEL if no longer present
        if (filters.KODE_MAPEL && !mapelList.find(m => m.value === String(filters.KODE_MAPEL))) {
          setFilters(prev => ({ ...prev, KODE_MAPEL: '' }));
        }
      }
    } catch (err) {
      console.error('Error load data by year:', err);
      // on error, clear relevant lists
      setOpsiTingkat([]);
      setOpsiJurusan([]);
      setOpsiKelas([]);
      setOpsiMapel([]);
    } finally {
      // only clear general loading if this request is current
      setLoadingMapel(false);
    }
  };

  /* ================= Template untuk Dropdown Mapel dengan Tag ================= */
  const mapelOptionTemplate = (option) => {
    if (!option) return null;
    const namaLabel = typeof option.label === 'string' ? option.label : String(option.label || '');
    const match = namaLabel.match(/^(.*)\s+\((.*)\)$/);
    const nama = match ? match[1] : namaLabel;
    const kode = match ? match[2] : (typeof option.value === 'string' ? option.value : String(option.value || ''));
    return (
      <div className="flex align-items-center gap-2">
        <span>{nama}</span>
        {kode && <Tag value={kode} severity="info" className="text-xs" />}
      </div>
    );
  };

  const mapelValueTemplate = (selected) => {
    if (!selected) return <span className="text-500">Pilih Mata Pelajaran</span>;

    let opt = null;
    if (typeof selected === 'string' || typeof selected === 'number') {
      opt = opsiMapel.find((o) => String(o.value) === String(selected));
    } else if (typeof selected === 'object' && selected !== null) {
      const selValue = selected.value ?? selected.KODE_MAPEL ?? selected.KODE ?? null;
      if (selValue) opt = opsiMapel.find((o) => String(o.value) === String(selValue));
      else opt = selected;
    }

    if (!opt) return <span>{String(selected)}</span>;
    const namaLabel = typeof opt.label === 'string' ? opt.label : String(opt.label || '');
    const match = namaLabel.match(/^(.*)\s+\((.*)\)$/);
    const nama = match ? match[1] : namaLabel;
    const kode = match ? match[2] : (opt.value ?? '');
    return (
      <div className="flex align-items-center gap-2">
        <span>{nama}</span>
        {kode && <Tag value={String(kode)} severity="info" className="text-xs" />}
      </div>
    );
  };

  /* ================= helper: tampilkan label mapel yang aman ================= */
  const getSelectedMapelLabel = () => {
    const sel = filters.KODE_MAPEL;
    if (!sel) return '';
    if (typeof sel === 'string' || typeof sel === 'number') {
      const found = opsiMapel.find(o => String(o.value) === String(sel));
      if (found) {
        const match = String(found.label).match(/^(.*)\s+\((.*)\)$/);
        return match ? `${match[1]} (${match[2]})` : String(found.label);
      }
      return String(sel);
    }
    if (typeof sel === 'object') {
      const nama = sel.label || sel.NAMA_MAPEL || sel.NAMA || sel.name;
      const kode = sel.value || sel.KODE_MAPEL || sel.KODE || sel.code;
      if (nama && kode) return `${nama} (${kode})`;
      if (nama) return String(nama);
      if (kode) return String(kode);
    }
    return String(sel);
  };

  /* ================= fetchEntryData (manual via button) ================= */
  const fetchEntryData = async () => {
    if (!token) {
      toastRef.current?.showToast('02', 'Silakan login ulang');
      return;
    }
    if (!filters.TAHUN_AJARAN_ID || !filters.KELAS_ID || !filters.KODE_MAPEL) {
      toastRef.current?.showToast('02', 'Lengkapi filter terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosWithAuth(token).get('/transaksi-nilai', {
        params: {
          kelasId: filters.KELAS_ID,
          mapelId: filters.KODE_MAPEL,
          tahunId: filters.TAHUN_AJARAN_ID
        }
      });

      if (res.data?.status === '00') {
        const studentsRaw = res.data.data || [];
        const normalized = studentsRaw.map((s, idx) => ({
          id: s.id ?? s.nis ?? s.NIS ?? idx + 1,
          no: idx + 1,
          namaSiswa: s.nama ?? s.NAMA ?? s.namaSiswa ?? 'Tanpa Nama',
          pengetahuan: {
            angka: s.nilai_p ?? s.NILAI_P ?? '',
            predikat: s.predikat_p ?? (s.nilai_p != null ? computePredikat(s.nilai_p, res.data.meta) : '-'),
            deskripsi: s.deskripsi_p ?? '-'
          },
          keterampilan: {
            angka: s.nilai_k ?? s.NILAI_K ?? '',
            predikat: s.predikat_k ?? (s.nilai_k != null ? computePredikat(s.nilai_k, res.data.meta) : '-'),
            deskripsi: s.deskripsi_k ?? '-'
          }
        }));
        setMeta(res.data.meta || { kkm: 75, deskripsi_template: {}, interval_predikat: {} });
        setGrades(normalized);
        setIsTableVisible(true);
        toastRef.current?.showToast('00', `Data dimuat. KKM: ${res.data.meta?.kkm ?? '-'}`);
      } else {
        setGrades([]);
        setIsTableVisible(false);
        toastRef.current?.showToast('02', res.data?.message || 'Tidak ada data nilai');
      }
    } catch (err) {
      console.error('Error fetch entry data:', err);
      setGrades([]);
      setIsTableVisible(false);
      toastRef.current?.showToast('01', 'Gagal memuat data nilai');
    } finally {
      setLoading(false);
    }
  };

  /* ================= helper predikat/deskripsi ================= */
  const computePredikat = (nilai, metaObj = meta) => {
    if (nilai === null || nilai === '' || nilai === undefined) return '-';
    const kkmVal = parseFloat(metaObj?.kkm ?? 75);
    const val = parseFloat(nilai);
    if (isNaN(val)) return '-';
    const interval = (100 - kkmVal) / 3;
    if (val < kkmVal) return 'D';
    if (val < kkmVal + interval) return 'C';
    if (val < kkmVal + interval * 2) return 'B';
    return 'A';
  };

  const computeDeskripsi = (nilai, metaObj = meta) => {
    const p = computePredikat(nilai, metaObj);
    return metaObj?.deskripsi_template?.[p] ?? '-';
  };

  /* ================= grade change / save / saveAll / delete ================= */
  const onGradeChange = (e, rowData, gradeType, subType) => {
    const val = e.target.value;
    if (val !== '' && isNaN(val)) return;
    if (val !== '' && (Number(val) < 0 || Number(val) > 100)) return;

    const updated = grades.map(g => {
      if (g.id === rowData.id) {
        const angka = val;
        const predikat = computePredikat(angka);
        const deskripsi = predikat === '-' ? '-' : computeDeskripsi(angka);
        return {
          ...g,
          [gradeType]: {
            ...g[gradeType],
            [subType]: angka,
            predikat,
            deskripsi
          }
        };
      }
      return g;
    });

    setGrades(updated);
  };

  const saveGrades = async (rowData) => {
    try {
      const payload = {
        students: [
          {
            id: rowData.id,
            nilai_p: rowData.pengetahuan.angka === '' ? null : Number(rowData.pengetahuan.angka),
            nilai_k: rowData.keterampilan.angka === '' ? null : Number(rowData.keterampilan.angka)
          }
        ],
        kelasId: filters.KELAS_ID,
        mapelId: filters.KODE_MAPEL,
        tahunId: filters.TAHUN_AJARAN_ID
      };

      const res = await axiosWithAuth(token).post('/transaksi-nilai', payload);
      if (res.data?.status === '00') {
        toastRef.current?.showToast('00', `Nilai siswa ${rowData.namaSiswa} berhasil disimpan!`);
        fetchEntryData();
      } else {
        toastRef.current?.showToast('01', res.data?.message || 'Gagal menyimpan nilai');
      }
    } catch (err) {
      console.error('Error save single:', err);
      toastRef.current?.showToast('01', 'Gagal menyimpan nilai');
    }
  };

  const saveAll = async () => {
    if (grades.length === 0) {
      toastRef.current?.showToast('02', 'Tidak ada data untuk disimpan');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        students: grades.map(g => ({
          id: g.id,
          nilai_p: g.pengetahuan.angka === '' ? null : Number(g.pengetahuan.angka),
          nilai_k: g.keterampilan.angka === '' ? null : Number(g.keterampilan.angka)
        })),
        kelasId: filters.KELAS_ID,
        mapelId: filters.KODE_MAPEL,
        tahunId: filters.TAHUN_AJARAN_ID
      };

      const res = await axiosWithAuth(token).post('/transaksi-nilai', payload);
      if (res.data?.status === '00') {
        toastRef.current?.showToast('00', 'Semua nilai berhasil disimpan');
        fetchEntryData();
      } else {
        toastRef.current?.showToast('01', res.data?.message || 'Gagal menyimpan semua nilai');
      }
    } catch (err) {
      console.error('Error saveAll:', err);
      toastRef.current?.showToast('01', 'Gagal menyimpan semua nilai');
    } finally {
      setLoading(false);
    }
  };

  const deleteSingle = (row) => {
    confirmDialog({
      message: `Hapus nilai siswa ${row.namaSiswa}?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await axiosWithAuth(token).delete(`/transaksi-nilai/${row.id}`);
          toastRef.current?.showToast('00', 'Nilai berhasil dihapus');
          fetchEntryData();
        } catch (err) {
          console.error('Error delete:', err);
          toastRef.current?.showToast('01', 'Gagal menghapus nilai');
        }
      }
    });
  };

  /* ================= table templates ================= */
  const actionTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button icon="pi pi-save" size="small" onClick={() => saveGrades(rowData)} tooltip="Simpan" />
      <Button icon="pi pi-trash" size="small" className="p-button-danger" onClick={() => deleteSingle(rowData)} tooltip="Hapus" />
    </div>
  );

  const nilaiTemplate = (rowData, gradeType, subType) => (
    <InputText
      value={rowData[gradeType][subType]}
      onChange={(e) => onGradeChange(e, rowData, gradeType, subType)}
      className="w-full text-center"
      placeholder="0"
    />
  );

  const columns = [
    { field: 'no', header: 'No.', style: { width: '50px' } },
    { field: 'namaSiswa', header: 'Nama Siswa', style: { minWidth: '150px' } },
    { header: 'Angka (Pengetahuan)', body: (row) => nilaiTemplate(row, 'pengetahuan', 'angka'), style: { width: '100px' } },
    { field: 'pengetahuan.predikat', header: 'Predikat (Pengetahuan)', style: { width: '80px' } },
    { field: 'pengetahuan.deskripsi', header: 'Deskripsi (Pengetahuan)', style: { minWidth: '200px' } },
    { header: 'Angka (Keterampilan)', body: (row) => nilaiTemplate(row, 'keterampilan', 'angka'), style: { width: '100px' } },
    { field: 'keterampilan.predikat', header: 'Predikat (Keterampilan)', style: { width: '80px' } },
    { field: 'keterampilan.deskripsi', header: 'Deskripsi (Keterampilan)', style: { minWidth: '200px' } },
    { header: 'Aksi', body: actionTemplate, style: { width: '120px' } },
  ];

  /* ================= render ================= */
  return (
    <div className="grid justify-content-center">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <div className="col-12 md:col-11">
        <Card className="mb-4 shadow-1">
          <h5 className="font-bold text-900">Entry Nilai Siswa</h5>
          <p className="text-sm text-500 mb-3">
            Dropdown hanya menampilkan opsi yang Anda ampu berdasarkan profil guru. 
            Pilih Tahun → Tingkat → Jurusan → Kelas → Mapel → klik &quot;Tampilkan Tabel&quot;.
          </p>
          <Divider />

          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-2">
              <label className="font-medium">Tahun Ajaran</label>
              <Dropdown
                value={filters.TAHUN_AJARAN_ID}
                options={opsiTahun}
                onChange={(e) => { 
                  setFilters({ 
                    ...filters, 
                    TAHUN_AJARAN_ID: e.value, 
                    TINGKATAN_ID: '',
                    JURUSAN_ID: '',
                    KELAS_ID: '', 
                    KODE_MAPEL: '' 
                  }); 
                  setIsTableVisible(false); 
                }}
                placeholder="Pilih Tahun (yang Anda ampu)"
                disabled={opsiTahun.length === 0}
              />
              {opsiTahun.length === 0 && !loadingMapel && (
                <small className="text-orange-600">Tidak ada tahun ajaran yang Anda ampu.</small>
              )}
            </div>

            <div className="field col-12 md:col-2">
              <label className="font-medium">Tingkat</label>
              <Dropdown
                value={filters.TINGKATAN_ID}
                options={opsiTingkat}
                onChange={(e) => { 
                  setFilters({ 
                    ...filters, 
                    TINGKATAN_ID: e.value,
                    JURUSAN_ID: '',
                    KELAS_ID: '' 
                  }); 
                  setIsTableVisible(false); 
                }}
                placeholder="Pilih Tingkat"
                showClear
                disabled={!filters.TAHUN_AJARAN_ID || opsiTingkat.length === 0}
              />
            </div>

            <div className="field col-12 md:col-2">
              <label className="font-medium">Jurusan</label>
              <Dropdown
                value={filters.JURUSAN_ID}
                options={opsiJurusan}
                onChange={(e) => { 
                  setFilters({ 
                    ...filters, 
                    JURUSAN_ID: e.value, 
                    KELAS_ID: '' 
                  }); 
                  setIsTableVisible(false); 
                }}
                placeholder="Pilih Jurusan"
                showClear
                disabled={!filters.TAHUN_AJARAN_ID || opsiJurusan.length === 0}
              />
            </div>

            <div className="field col-12 md:col-2">
              <label className="font-medium">Kelas</label>
              <Dropdown
                value={filters.KELAS_ID}
                options={opsiKelas}
                onChange={(e) => { 
                  setFilters({ ...filters, KELAS_ID: e.value }); 
                  setIsTableVisible(false); 
                }}
                placeholder="Pilih Kelas"
                disabled={!filters.TAHUN_AJARAN_ID || opsiKelas.length === 0}
                emptyMessage="Tidak ada kelas"
              />
            </div>

            <div className="field col-12 md:col-4">
              <label className="font-medium">
                Mata Pelajaran
                {/* show spinner when either general mapel loading or the intensive calculation is running */}
                {(loadingMapel || loadingMapelCalc) && (
                  <i className="pi pi-spin pi-spinner ml-2 text-sm" aria-hidden />
                )}
              </label>
              <Dropdown
                value={filters.KODE_MAPEL}
                options={opsiMapel}
                onChange={(e) => { 
                  setFilters({ ...filters, KODE_MAPEL: e.value }); 
                  setIsTableVisible(false); 
                }}
                placeholder="Pilih Mapel"
                itemTemplate={mapelOptionTemplate}
                valueTemplate={mapelValueTemplate}
                disabled={!filters.TAHUN_AJARAN_ID || loadingMapel || opsiMapel.length === 0}
                showClear
                filter
              />
              {filters.TAHUN_AJARAN_ID && !loadingMapel && opsiMapel.length === 0 && (
                <small className="text-orange-600">Mapel yang Anda ampu belum tersedia untuk filter yang dipilih.</small>
              )}
            </div>
          </div>

          <div className="flex justify-content-end gap-2 mt-4">
            <Button 
              label="Bersihkan" 
              icon="pi pi-times" 
              outlined 
              onClick={() => {
                setFilters({ 
                  TAHUN_AJARAN_ID: '', 
                  TINGKATAN_ID: '', 
                  JURUSAN_ID: '', 
                  KELAS_ID: '', 
                  KODE_MAPEL: '' 
                });
                setGrades([]);
                setIsTableVisible(false);
              }} 
            />
            <Button 
              label="Tampilkan Tabel" 
              icon="pi pi-check" 
              onClick={fetchEntryData}
              disabled={!filters.TAHUN_AJARAN_ID || !filters.KELAS_ID || !filters.KODE_MAPEL}
            />
          </div>

          {/* Info KKM & Interval (ditampilkan setelah data dimuat) */}
          {meta?.kkm !== undefined && grades.length > 0 && isTableVisible && (
            <>
              <Divider className="my-3" />
              <div className="p-3 bg-blue-50 border-round">
                <p className="m-0 text-sm">
                  <strong>KKM:</strong> {meta.kkm}
                  <strong className="ml-4">Interval:</strong>
                  {Object.entries(meta.interval_predikat || {}).map(([key, val]) => (
                    <span key={key} className="inline-flex items-center ml-3 text-sm">
                      <span className="font-semibold mr-1">{key}:</span>
                      <span>{val}</span>
                    </span>
                  ))}
                </p>
              </div>
            </>
          )}
        </Card>
      </div>

      {loading && (
        <div className="col-12 md:col-11">
          <div className="flex justify-center p-8"><ProgressSpinner /></div>
        </div>
      )}

      {!loading && isTableVisible && grades.length > 0 && (
        <div className="col-12 md:col-11">
          <Card className="shadow-1">
            <h5 className="font-bold text-900">
              Tabel Nilai ({filters.KELAS_ID} - {getSelectedMapelLabel()})
            </h5>
            <p className="text-sm text-500 mb-3">Isi nilai angka untuk melihat predikat dan deskripsi otomatis.</p>
            <Divider className="my-2" />

            <div className="flex justify-content-end mb-3">
              <Button 
                label="Simpan Semua" 
                icon="pi pi-save" 
                severity="success" 
                onClick={saveAll} 
                loading={loading} 
              />
            </div>

            <CustomDataTable
              data={grades}
              columns={columns}
              paginator
              rows={10}
              rowsPerPageOptions={[10, 20]}
            />
          </Card>
        </div>
      )}

      {!loading && isTableVisible && grades.length === 0 && (
        <div className="col-12 md:col-11">
          <Card className="p-6 bg-white text-center">
            <i className="pi pi-info-circle text-4xl text-gray-400 mb-3"></i>
            <p className="text-gray-600">Tidak ada data siswa atau KKM belum diatur</p>
          </Card>
        </div>
      )}
    </div>
  );
}
