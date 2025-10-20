'use client';

import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const roles = [
  { label: 'KURIKULUM', value: 'KURIKULUM' },
  { label: 'KESISWAAN', value: 'KESISWAAN' },
  { label: 'KEUANGAN', value: 'KEUANGAN' },
  { label: 'TU_TASM', value: 'TU_TASM' },
  { label: 'BP_BKM', value: 'BP_BKM' },
  { label: 'ADMIN_WEB', value: 'ADMIN_WEB' },
  { label: 'GURU', value: 'GURU' },
  { label: 'SISWA', value: 'SISWA' },
];

// Field khusus tiap role
const roleFields = {
  SISWA: [
    { name: 'nis', label: 'NIS', type: 'text' },
    { name: 'kelas', label: 'Kelas', type: 'text' },
    { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'text' },
    { name: 'alamat', label: 'Alamat', type: 'text' },
  ],
  GURU: [
    { name: 'nip', label: 'NIP', type: 'text' },
    { name: 'mata_pelajaran', label: 'Mata Pelajaran', type: 'text' },
    { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'text' },
    { name: 'gelar_depan', label: 'Gelar Depan', type: 'text' },
    { name: 'gelar_belakang', label: 'Gelar Belakang', type: 'text' },
    { name: 'pangkat', label: 'Pangkat', type: 'text' },
    { name: 'jabatan', label: 'Jabatan', type: 'text' },
    { name: 'status_kepegawaian', label: 'Status Kepegawaian', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'no_telp', label: 'No Telp', type: 'text' },
    { name: 'alamat', label: 'Alamat', type: 'text' },
  ],
  // Dummy fields untuk role lain
  KURIKULUM: [{ name: 'dummy_kurikulum', label: 'Dummy Kurikulum', type: 'text' }],
  KESISWAAN: [{ name: 'dummy_kesiswaan', label: 'Dummy Kesiswaan', type: 'text' }],
  KEUANGAN: [{ name: 'dummy_keuangan', label: 'Dummy Keuangan', type: 'text' }],
  TU_TASM: [{ name: 'dummy_tu', label: 'Dummy TU/TASM', type: 'text' }],
  BP_BKM: [{ name: 'dummy_bp', label: 'Dummy BP/BKM', type: 'text' }],
  ADMIN_WEB: [{ name: 'dummy_admin', label: 'Dummy Admin Web', type: 'text' }],
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const UserFormLengkapi = ({ isOpen, onClose, user }) => {
  const defaultValues = {
    name: '',
    email: '',
    role: 'GURU',
    password: '',
    // semua field role
    nis: '',
    kelas: '',
    tanggal_lahir: '',
    alamat: '',
    nip: '',
    mata_pelajaran: '',
    gelar_depan: '',
    gelar_belakang: '',
    pangkat: '',
    jabatan: '',
    status_kepegawaian: '',
    no_telp: '',
    dummy_kurikulum: '',
    dummy_kesiswaan: '',
    dummy_keuangan: '',
    dummy_tu: '',
    dummy_bp: '',
    dummy_admin: '',
  };

  const initialValues = user ? { ...defaultValues, ...user } : defaultValues;

  const validationSchema = Yup.object({
    name: Yup.string().required('Nama wajib diisi'),
    email: Yup.string().email('Email tidak valid').required('Email wajib diisi'),
    role: Yup.string().required('Role wajib dipilih'),
  });

  const handleSubmit = async (values, actions) => {
    try {
      // Filter field sesuai role
      let payload = { role: values.role, name: values.name, email: values.email };

      roleFields[values.role]?.forEach((field) => {
        payload[field.name] = values[field.name];
      });

      const res = await axios.post(`${API_URL}/master-guru/`, payload);
      console.log(res.data);
      onClose();
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <Dialog style={{ minWidth: '50vw' }} header={`Lengkapi Data Diri: ${user?.name || ''}`} visible={isOpen} onHide={onClose}>
      <Formik initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, handleChange, setFieldValue, isSubmitting }) => (
          <Form>
            <div className="mt-3">
              <label htmlFor="name">Nama</label>
              <InputText id="name" name="name" className="w-full mt-2" value={values.name} onChange={handleChange} />
              <ErrorMessage name="name" component="small" className="p-error" />
            </div>

            <div className="mt-3">
              <label htmlFor="email">Email</label>
              <InputText id="email" name="email" className="w-full mt-2" value={values.email} onChange={handleChange} />
              <ErrorMessage name="email" component="small" className="p-error" />
            </div>

            <div className="mt-3">
              <label htmlFor="role">Role</label>
              <Dropdown id="role" name="role" value={values.role} options={roles} onChange={(e) => setFieldValue('role', e.value)} className="w-full mt-2" placeholder="Select Role" />
              <ErrorMessage name="role" component="small" className="p-error" />
            </div>

            {/* Field Dinamis */}
            {roleFields[values.role]?.map((field) => (
              <div className="mt-3" key={field.name}>
                <label htmlFor={field.name}>{field.label}</label>
                <InputText id={field.name} name={field.name} className="w-full mt-2" value={values[field.name]} onChange={handleChange} />
                <ErrorMessage name={field.name} component="small" className="p-error" />
              </div>
            ))}

            <div className="flex justify-end gap-2 mt-5">
              <Button label="Batal" severity="secondary" onClick={onClose} />
              <Button label="Simpan Data" type="submit" severity="success" disabled={isSubmitting} icon="pi pi-save" />
            </div>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default UserFormLengkapi;
