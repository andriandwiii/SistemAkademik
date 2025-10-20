/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useContext, useRef, useState, useEffect } from 'react';
import { LayoutContext } from '../../../../../layout/context/layoutcontext';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import CustomDataTable from '../../../../components/DataTable';
import ToastNotifier from '../../../../components/ToastNotifier';

const DashboardRapor = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const toastRef = useRef(null);
    const [isTableVisible, setIsTableVisible] = useState(false);

    // --- Form State ---
    const [jenisNilai, setJenisNilai] = useState(null);
    const [kelas, setKelas] = useState(null);
    const [mataPelajaran, setMataPelajaran] = useState(null);

    // --- Dummy Data Form ---
    const jenisNilaiOptions = ['Tugas', 'Ulangan Harian', 'Ulangan Tengah Semester', 'Ulangan Akhir Semester'];
    const kelasOptions = ['X IPA 1', 'X IPS 1', 'XI IPA 2', 'XI IPS 1', 'XII IPA 3', 'XII IPS 1'];
    const subjects = {
        'X IPA 1': ['Matematika', 'Biologi', 'Fisika'],
        'X IPS 1': ['Sejarah', 'Geografi', 'Sosiologi'],
        'XI IPA 2': ['Kimia', 'Matematika', 'Fisika'],
        'XI IPS 1': ['Ekonomi', 'Geografi', 'Sosiologi'],
        'XII IPA 3': ['Kimia', 'Fisika', 'Biologi'],
        'XII IPS 1': ['Sejarah', 'Ekonomi', 'Sosiologi'],
    };
    const studentNames = ['Adelia Puteri Lestari', 'Bambang Eka Putra', 'Citra Dewi', 'David Nugroho', 'Eka Fitriani'];

    // --- Data Tabel Nilai (Dummy) ---
    const [grades, setGrades] = useState([]);

    const handleFormSubmit = () => {
        if (!jenisNilai || !kelas || !mataPelajaran) {
            toastRef.current?.showToast('01', 'Harap lengkapi semua form');
            return;
        }

        // Generate dummy data for the table based on form selection
        const dummyGrades = studentNames.map((name, index) => ({
            id: index + 1,
            no: index + 1,
            namaSiswa: name,
            pengetahuan: {
                angka: '',
                predikat: '',
                deskripsi: ''
            },
            keterampilan: {
                angka: '',
                predikat: '',
                deskripsi: ''
            }
        }));
        setGrades(dummyGrades);
        setIsTableVisible(true);
    };

    const handleClearForm = () => {
        setJenisNilai(null);
        setKelas(null);
        setMataPelajaran(null);
        setIsTableVisible(false);
        setGrades([]);
    };

    const onGradeChange = (e, rowData, gradeType, subType) => {
        const val = e.target.value;
        const _grades = grades.map(grade => {
            if (grade.id === rowData.id) {
                return {
                    ...grade,
                    [gradeType]: {
                        ...grade[gradeType],
                        [subType]: val
                    }
                };
            }
            return grade;
        });
        setGrades(_grades);
    };
    
    const saveGrades = (rowData) => {
        toastRef.current?.showToast('00', `Nilai siswa ${rowData.namaSiswa} berhasil disimpan!`);
        // Di sini Anda akan mengimplementasikan logika untuk menyimpan data ke database.
    };

    const actionTemplate = (rowData) => (
        <Button icon="pi pi-save" size="small" onClick={() => saveGrades(rowData)} />
    );

    const pengetahuanTemplate = (rowData, col) => {
        return (
            <InputText
                value={rowData.pengetahuan[col.field]}
                onChange={(e) => onGradeChange(e, rowData, 'pengetahuan', col.field)}
                className="w-full text-center"
            />
        );
    };

    const keterampilanTemplate = (rowData, col) => {
        return (
            <InputText
                value={rowData.keterampilan[col.field]}
                onChange={(e) => onGradeChange(e, rowData, 'keterampilan', col.field)}
                className="w-full text-center"
            />
        );
    };

    const columns = [
        { field: 'no', header: 'No.', style: { width: '50px' } },
        { field: 'namaSiswa', header: 'Nama Siswa', style: { minWidth: '150px' } },
        {
            header: 'Pengetahuan',
            body: (rowData) => (
                <div className="flex gap-2">
                    <div style={{ flex: 1 }}>
                        <label>Angka</label>
                        {pengetahuanTemplate(rowData, { field: 'angka' })}
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Predikat</label>
                        {pengetahuanTemplate(rowData, { field: 'predikat' })}
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Deskripsi</label>
                        {pengetahuanTemplate(rowData, { field: 'deskripsi' })}
                    </div>
                </div>
            )
        },
        {
            header: 'Keterampilan',
            body: (rowData) => (
                <div className="flex gap-2">
                    <div style={{ flex: 1 }}>
                        <label>Angka</label>
                        {keterampilanTemplate(rowData, { field: 'angka' })}
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Predikat</label>
                        {keterampilanTemplate(rowData, { field: 'predikat' })}
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Deskripsi</label>
                        {keterampilanTemplate(rowData, { field: 'deskripsi' })}
                    </div>
                </div>
            )
        },
        { header: 'Aksi', body: actionTemplate, style: { width: '80px' } },
    ];
    
    return (
        <div className="grid">
            <ToastNotifier ref={toastRef} />
            <div className="col-12">
                <div className="card">
                    <h5>Cetak Rapor</h5>
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-4">
                            <label htmlFor="jenisNilai">Jenis Nilai</label>
                            <Dropdown
                                id="jenisNilai"
                                value={jenisNilai}
                                options={jenisNilaiOptions}
                                onChange={(e) => setJenisNilai(e.value)}
                                placeholder="Pilih Jenis Nilai"
                            />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="kelas">Kelas</label>
                            <Dropdown
                                id="kelas"
                                value={kelas}
                                options={kelasOptions}
                                onChange={(e) => {
                                    setKelas(e.value);
                                    setMataPelajaran(null);
                                }}
                                placeholder="Pilih Kelas"
                            />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="mataPelajaran">Mata Pelajaran</label>
                            <Dropdown
                                id="mataPelajaran"
                                value={mataPelajaran}
                                options={kelas ? subjects[kelas] : []}
                                onChange={(e) => setMataPelajaran(e.value)}
                                placeholder="Pilih Mata Pelajaran"
                                disabled={!kelas}
                            />
                        </div>
                    </div>
                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Bersihkan" icon="pi pi-times" outlined onClick={handleClearForm} />
                        <Button label="Tampilkan" icon="pi pi-check" onClick={handleFormSubmit} />
                    </div>
                </div>
            </div>

            {isTableVisible && (
                <div className="col-12">
                    <div className="card">
                        <h5>Tabel Nilai Rapor ({kelas} - {mataPelajaran})</h5>
                        <CustomDataTable
                            data={grades}
                            columns={columns}
                            paginator
                            rows={10}
                            className="p-datatable-sm text-sm"
                            rowHover
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardRapor;
