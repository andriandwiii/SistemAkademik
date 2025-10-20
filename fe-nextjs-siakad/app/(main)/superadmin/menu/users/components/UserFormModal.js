'use client';

import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

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
  ],
  KEUANGAN: [
    { name: 'id_keuangan', label: 'ID Keuangan', type: 'text' },
    { name: 'jabatan', label: 'Jabatan', type: 'text' },
  ],
  KURIKULUM: [
    { name: 'id_kurikulum', label: 'ID Kurikulum', type: 'text' },
    { name: 'jabatan', label: 'Jabatan', type: 'text' },
  ],
  // bisa tambah role lain jika perlu
};

const UserFormModal = ({ isOpen, onClose, onSubmit, user, mode }) => {
  const isEdit = mode === 'edit';
  const isLengkapi = mode === 'lengkapi';

  const defaultValues = {
    name: '',
    email: '',
    role: 'KURIKULUM',
    password: '',
    nis: '',
    kelas: '',
    tanggal_lahir: '',
    alamat: '',
    nip: '',
    mata_pelajaran: '',
    id_keuangan: '',
    id_kurikulum: '',
    jabatan: '',
  };

  const initialValues = user ? { ...defaultValues, ...user } : defaultValues;

  const validationSchema = Yup.object({
    name: Yup.string().required('Nama wajib diisi'),
    email: Yup.string().email('Email tidak valid').required('Email wajib diisi'),
    role: Yup.string().required('Role wajib dipilih'),
    password: !isEdit && !isLengkapi ? Yup.string().required('Password wajib diisi') : Yup.string(),
  });

  const title = isEdit
    ? `Edit User: ${user?.name || ''}`
    : isLengkapi
    ? `Lengkapi Data Diri: ${user?.name || ''}`
    : 'Tambah User';

  return (
    <Dialog style={{ minWidth: '50vw' }} header={title} visible={isOpen} onHide={onClose}>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={(values, actions) => {
          // Filter payload agar hanya kirim field yang relevan
          let payload = {
            name: values.name,
            email: values.email,
            role: values.role,
          };

          if (!isEdit && !isLengkapi) {
            payload.password = values.password;
          }

          // Tambahkan field spesifik role jika mode lengkapi
          if (isLengkapi) {
            if (values.role === 'SISWA') {
              payload.nis = values.nis;
              payload.kelas = values.kelas;
              payload.tanggal_lahir = values.tanggal_lahir;
              payload.alamat = values.alamat;
            } else if (values.role === 'GURU') {
              payload.nip = values.nip;
              payload.mata_pelajaran = values.mata_pelajaran;
              payload.tanggal_lahir = values.tanggal_lahir;
            } else if (values.role === 'KEUANGAN') {
              payload.id_keuangan = values.id_keuangan;
              payload.jabatan = values.jabatan;
            } else if (values.role === 'KURIKULUM') {
              payload.id_kurikulum = values.id_kurikulum;
              payload.jabatan = values.jabatan;
            }
          }

          onSubmit(payload);
          actions.setSubmitting(false);
        }}
      >
        {({ values, handleChange, setFieldValue, isSubmitting }) => (
          <Form>
            {/* Basic Fields */}
            <div className="mt-3">
              <label htmlFor="name">Nama</label>
              <InputText
                id="name"
                name="name"
                className="w-full mt-2"
                value={values.name}
                onChange={handleChange}
              />
              <ErrorMessage name="name" component="small" className="p-error" />
            </div>

            <div className="mt-3">
              <label htmlFor="email">Email</label>
              <InputText
                id="email"
                name="email"
                className="w-full mt-2"
                value={values.email}
                onChange={handleChange}
              />
              <ErrorMessage name="email" component="small" className="p-error" />
            </div>

            {!isEdit && !isLengkapi && (
              <div className="mt-3">
                <label htmlFor="password">Password</label>
                <InputText
                  id="password"
                  name="password"
                  type="password"
                  className="w-full mt-2"
                  value={values.password}
                  onChange={handleChange}
                />
                <ErrorMessage name="password" component="small" className="p-error" />
              </div>
            )}

            {!isLengkapi && (
              <div className="mt-3">
                <label htmlFor="role">Role</label>
                <Dropdown
                  id="role"
                  name="role"
                  value={values.role}
                  options={roles}
                  onChange={(e) => setFieldValue('role', e.value)}
                  className="w-full mt-2"
                  placeholder="Select Role"
                />
                <ErrorMessage name="role" component="small" className="p-error" />
              </div>
            )}

            {/* Dynamic Fields hanya untuk lengkapi data */}
            {isLengkapi &&
              roleFields[values.role]?.map((field) => (
                <div className="mt-3" key={field.name}>
                  <label htmlFor={field.name}>{field.label}</label>
                  <InputText
                    id={field.name}
                    name={field.name}
                    className="w-full mt-2"
                    value={values[field.name]}
                    onChange={handleChange}
                  />
                  <ErrorMessage name={field.name} component="small" className="p-error" />
                </div>
              ))}

            <div className="flex justify-end gap-2 mt-5">
              <Button label="Batal" severity="secondary" onClick={onClose} />
              <Button
                label={isEdit ? 'Update' : isLengkapi ? 'Simpan Data' : 'Simpan'}
                type="submit"
                severity="success"
                disabled={isSubmitting}
                icon="pi pi-save"
              />
            </div>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default UserFormModal;
