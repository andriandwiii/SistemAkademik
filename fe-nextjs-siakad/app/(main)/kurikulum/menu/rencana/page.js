'use client';

import { useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import CustomDataTable from '../../../../components/DataTable';
import ToastNotifier from '../../../../components/ToastNotifier';

const PerencanaanBelajarPage = () => {
  const toastRef = useRef(null);

  const kelasOptions = ['X IPA 1', 'X IPS 1', 'XI IPA 2', 'XI IPS 1', 'XII IPA 3', 'XII IPS 1'];
  const subjects = ['Matematika', 'Biologi', 'Fisika', 'Sejarah', 'Geografi', 'Sosiologi', 'Kimia', 'Ekonomi'];
  const metodeOptions = ['Ceramah', 'Diskusi', 'Praktikum', 'Proyek', 'Penugasan Mandiri'];

  const emptyPlan = {
    id: null,
    kelas: '',
    mataPelajaran: '',
    kompetensiDasar: '',
    materiPokok: '',
    metode: '',
    alokasiWaktu: '',
    penilaian: ''
  };

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(emptyPlan);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // --- Form Input Handler ---
  const onInputChange = (e, field) => {
    const val = e.target.value;
    setSelectedPlan(prev => ({ ...prev, [field]: val }));
  };

  const handleFormSubmit = () => {
    const { kelas, mataPelajaran, kompetensiDasar, materiPokok, metode, alokasiWaktu, penilaian } = selectedPlan;
    if (!kelas || !mataPelajaran || !kompetensiDasar || !materiPokok || !metode || !alokasiWaktu || !penilaian) {
      toastRef.current?.showToast('01', 'Harap lengkapi semua form.');
      return;
    }

    let _plans = [...plans];
    if (selectedPlan.id) {
      const index = _plans.findIndex(p => p.id === selectedPlan.id);
      _plans[index] = selectedPlan;
      toastRef.current?.showToast('00', 'Rencana belajar berhasil diperbarui!');
    } else {
      _plans.push({ ...selectedPlan, id: Date.now() });
      toastRef.current?.showToast('00', 'Rencana belajar berhasil ditambahkan!');
    }

    setPlans(_plans);
    setSelectedPlan(emptyPlan);
    setIsFormVisible(false);
  };

  const handleEdit = (plan) => {
    setSelectedPlan({ ...plan });
    setIsFormVisible(true);
  };

  const handleDelete = (plan) => {
    confirmDialog({
      message: `Yakin ingin menghapus rencana belajar "${plan.mataPelajaran}" untuk kelas ${plan.kelas}?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      acceptClassName: 'p-button-danger',
      accept: () => {
        setPlans(prev => prev.filter(p => p.id !== plan.id));
        toastRef.current?.showToast('00', 'Rencana belajar berhasil dihapus!');
      },
    });
  };

  const actionBodyTemplate = (row) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" size="small" severity="warning" onClick={() => handleEdit(row)} />
      <Button icon="pi pi-trash" size="small" severity="danger" onClick={() => handleDelete(row)} />
    </div>
  );

  const columns = [
    { field: 'kelas', header: 'Kelas', style: { width: '100px' } },
    { field: 'mataPelajaran', header: 'Mata Pelajaran', style: { minWidth: '150px' } },
    { field: 'kompetensiDasar', header: 'Kompetensi Dasar', style: { minWidth: '200px' } },
    { field: 'materiPokok', header: 'Materi Pokok', style: { minWidth: '200px' } },
    { field: 'metode', header: 'Metode', style: { width: '150px' } },
    { field: 'alokasiWaktu', header: 'Alokasi Waktu', style: { width: '120px' } },
    { field: 'penilaian', header: 'Penilaian', style: { minWidth: '150px' } },
    { header: 'Aksi', body: actionBodyTemplate, style: { width: '120px' } },
  ];

  return (
    <div className="grid">
      <ToastNotifier ref={toastRef} />

      <div className="col-12">
        <Card className="mb-4 shadow-1">
          <div className="flex justify-content-between align-items-center mb-3">
            <h5 className="font-bold text-900">Perencanaan Kegiatan Belajar</h5>
            <Button
              label="Tambah Rencana"
              icon="pi pi-plus"
              onClick={() => {
                setSelectedPlan(emptyPlan);
                setIsFormVisible(true);
              }}
            />
          </div>

          {isFormVisible && (
            <>
              <Divider />
              <div className="p-fluid formgrid grid">
                <div className="field col-12 md:col-4">
                  <label className="font-medium">Kelas</label>
                  <Dropdown
                    value={selectedPlan.kelas}
                    options={kelasOptions}
                    onChange={(e) => onInputChange(e, 'kelas')}
                    placeholder="Pilih Kelas"
                  />
                </div>
                <div className="field col-12 md:col-4">
                  <label className="font-medium">Mata Pelajaran</label>
                  <Dropdown
                    value={selectedPlan.mataPelajaran}
                    options={subjects}
                    onChange={(e) => onInputChange(e, 'mataPelajaran')}
                    placeholder="Pilih Mata Pelajaran"
                  />
                </div>
                <div className="field col-12 md:col-4">
                  <label className="font-medium">Metode</label>
                  <Dropdown
                    value={selectedPlan.metode}
                    options={metodeOptions}
                    onChange={(e) => onInputChange(e, 'metode')}
                    placeholder="Pilih Metode"
                  />
                </div>
                <div className="field col-12 md:col-6">
                  <label className="font-medium">Kompetensi Dasar</label>
                  <InputTextarea
                    value={selectedPlan.kompetensiDasar}
                    onChange={(e) => onInputChange(e, 'kompetensiDasar')}
                    rows={2}
                    autoResize
                  />
                </div>
                <div className="field col-12 md:col-6">
                  <label className="font-medium">Materi Pokok</label>
                  <InputTextarea
                    value={selectedPlan.materiPokok}
                    onChange={(e) => onInputChange(e, 'materiPokok')}
                    rows={2}
                    autoResize
                  />
                </div>
                <div className="field col-12 md:col-6">
                  <label className="font-medium">Alokasi Waktu</label>
                  <InputText
                    value={selectedPlan.alokasiWaktu}
                    onChange={(e) => onInputChange(e, 'alokasiWaktu')}
                    placeholder="Contoh: 2 x 45 menit"
                  />
                </div>
                <div className="field col-12 md:col-6">
                  <label className="font-medium">Penilaian</label>
                  <InputText
                    value={selectedPlan.penilaian}
                    onChange={(e) => onInputChange(e, 'penilaian')}
                    placeholder="Contoh: Tes Tertulis / Praktikum"
                  />
                </div>
              </div>

              <div className="flex justify-content-end gap-2 mt-4">
                <Button
                  label="Batal"
                  icon="pi pi-times"
                  outlined
                  onClick={() => setIsFormVisible(false)}
                />
                <Button
                  label="Simpan"
                  icon="pi pi-save"
                  onClick={handleFormSubmit}
                />
              </div>
            </>
          )}
        </Card>
      </div>

      <div className="col-12">
        <Card className="shadow-1">
          <h5 className="font-bold text-900 mb-3">Daftar Rencana Belajar</h5>
          <CustomDataTable
            data={plans}
            columns={columns}
            paginator
            rows={10}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </Card>
      </div>

      <ConfirmDialog />
    </div>
  );
};

export default PerencanaanBelajarPage;
