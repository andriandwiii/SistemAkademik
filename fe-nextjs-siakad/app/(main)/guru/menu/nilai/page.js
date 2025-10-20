/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useContext, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import ToastNotifier from '@/app/components/ToastNotifier';
import CustomDataTable from '@/app/components/DataTable';

const NilaiSiswaPage = () => {
    const toastRef = useRef(null);
    const [isTableVisible, setIsTableVisible] = useState(false);

    // --- State Form Input Nilai ---
    const [kelas, setKelas] = useState(null);
    const [mataPelajaran, setMataPelajaran] = useState(null);
    const [jenisNilai, setJenisNilai] = useState(null);

    // --- Dummy Data ---
    const kelasOptions = ['X IPA 1', 'X IPS 1', 'XI IPA 2', 'XI IPS 1', 'XII IPA 3', 'XII IPS 1'];
    const subjects = {
        'X IPA 1': ['Matematika', 'Biologi', 'Fisika'],
        'X IPS 1': ['Sejarah', 'Geografi', 'Sosiologi'],
        'XI IPA 2': ['Kimia', 'Matematika', 'Fisika'],
        'XI IPS 1': ['Ekonomi', 'Geografi', 'Sosiologi'],
        'XII IPA 3': ['Kimia', 'Fisika', 'Biologi'],
        'XII IPS 1': ['Sejarah', 'Ekonomi', 'Sosiologi'],
    };
    const jenisNilaiOptions = ['Tugas', 'Ulangan Harian', 'Ulangan Tengah Semester', 'Ulangan Akhir Semester'];
    const studentNames = ['Adelia Puteri Lestari', 'Bambang Eka Putra', 'Citra Dewi', 'David Nugroho', 'Eka Fitriani'];

    // --- Data Nilai Siswa ---
    const [grades, setGrades] = useState([]);

    const getPredikat = (score) => {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        return 'D';
    };

    const getDeskripsi = (score) => {
        if (score >= 90) return 'Sangat menguasai materi dan mampu berkreasi dengan baik.';
        if (score >= 80) return 'Menguasai materi dengan baik dan mampu menerapkan konsep.';
        if (score >= 70) return 'Memahami materi dengan cukup baik.';
        return 'Perlu bimbingan lebih lanjut untuk menguasai materi.';
    };

    const handleFormSubmit = () => {
        if (!kelas || !mataPelajaran || !jenisNilai) {
            toastRef.current?.showToast('01', 'Harap lengkapi semua form.');
            return;
        }

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
        setKelas(null);
        setMataPelajaran(null);
        setJenisNilai(null);
        setIsTableVisible(false);
        setGrades([]);
    };

    const onGradeChange = (e, rowData, gradeType, subType) => {
        const val = e.target.value;
        const _grades = grades.map(grade => {
            if (grade.id === rowData.id) {
                const nilaiAngka = val;
                const predikat = getPredikat(nilaiAngka);
                const deskripsi = getDeskripsi(nilaiAngka);
                return {
                    ...grade,
                    [gradeType]: {
                        ...grade[gradeType],
                        [subType]: val,
                        predikat: predikat,
                        deskripsi: deskripsi
                    }
                };
            }
            return grade;
        });
        setGrades(_grades);
    };

    const saveGrades = (rowData) => {
        toastRef.current?.showToast('00', `Nilai siswa ${rowData.namaSiswa} berhasil disimpan!`);
        // Logic untuk menyimpan ke database akan diimplementasikan di sini
    };

    const actionTemplate = (rowData) => (
        <Button icon="pi pi-save" size="small" onClick={() => saveGrades(rowData)} />
    );

    const nilaiTemplate = (rowData, gradeType, subType) => {
        return (
            <InputText
                value={rowData[gradeType][subType]}
                onChange={(e) => onGradeChange(e, rowData, gradeType, subType)}
                className="w-full text-center"
            />
        );
    };

    const columns = [
        { field: 'no', header: 'No.', style: { width: '50px' } },
        { field: 'namaSiswa', header: 'Nama Siswa', style: { minWidth: '150px' } },
        { header: 'Angka (Pengetahuan)', body: (rowData) => nilaiTemplate(rowData, 'pengetahuan', 'angka'), style: { width: '100px' } },
        { field: 'pengetahuan.predikat', header: 'Predikat (Pengetahuan)', style: { width: '80px' } },
        { field: 'pengetahuan.deskripsi', header: 'Deskripsi (Pengetahuan)', style: { minWidth: '200px' } },
        { header: 'Angka (Keterampilan)', body: (rowData) => nilaiTemplate(rowData, 'keterampilan', 'angka'), style: { width: '100px' } },
        { field: 'keterampilan.predikat', header: 'Predikat (Keterampilan)', style: { width: '80px' } },
        { field: 'keterampilan.deskripsi', header: 'Deskripsi (Keterampilan)', style: { minWidth: '200px' } },
        { header: 'Aksi', body: actionTemplate, style: { width: '80px' } },
    ];

    return (
        <div className="grid justify-content-center">
            <ToastNotifier ref={toastRef} />
            <div className="col-12 md:col-11">
                <Card className="mb-4 shadow-1">
                    <h5 className="font-bold text-900">Input Nilai Siswa</h5>
                    <p className="text-sm text-500 mb-3">Pilih kelas, mata pelajaran, dan jenis nilai untuk memulai.</p>
                    <Divider />
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-4">
                            <label htmlFor="kelas" className="font-medium">Kelas</label>
                            <Dropdown
                                id="kelas"
                                value={kelas}
                                options={kelasOptions}
                                onChange={(e) => setKelas(e.value)}
                                placeholder="Pilih Kelas"
                            />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="mataPelajaran" className="font-medium">Mata Pelajaran</label>
                            <Dropdown
                                id="mataPelajaran"
                                value={mataPelajaran}
                                options={kelas ? subjects[kelas] : []}
                                onChange={(e) => setMataPelajaran(e.value)}
                                placeholder="Pilih Mata Pelajaran"
                                disabled={!kelas}
                            />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="jenisNilai" className="font-medium">Jenis Nilai</label>
                            <Dropdown
                                id="jenisNilai"
                                value={jenisNilai}
                                options={jenisNilaiOptions}
                                onChange={(e) => setJenisNilai(e.value)}
                                placeholder="Pilih Jenis Nilai"
                            />
                        </div>
                    </div>
                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Bersihkan" icon="pi pi-times" outlined onClick={handleClearForm} />
                        <Button label="Tampilkan Tabel" icon="pi pi-check" onClick={handleFormSubmit} />
                    </div>
                </Card>
            </div>
            {isTableVisible && (
                <div className="col-12 md:col-11">
                    <Card className="shadow-1">
                        <h5 className="font-bold text-900">Tabel Nilai ({kelas} - {mataPelajaran})</h5>
                        <p className="text-sm text-500 mb-3">Isi nilai siswa di kolom 'Nilai Angka' untuk melihat predikat dan deskripsi otomatis.</p>
                        <Divider className="my-2" />
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
        </div>
    );
};

export default NilaiSiswaPage;
