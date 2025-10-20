'use client';

import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const UserFormSiswa = ({ isOpen, onClose, onSubmit, user, mode }) => {
    const isEdit = mode === 'edit';
    const isLengkapi = mode === 'lengkapi';

    const defaultValues = {
        name: '',
        email: '',
        password: '',
        nis: '',
        kelas: '',
        tanggal_lahir: '',
        alamat: '',
    };

    const initialValues = user ? { ...defaultValues, ...user } : defaultValues;

    const validationSchema = Yup.object({
        name: Yup.string().required('Nama wajib diisi'),
        email: Yup.string().email('Email tidak valid').required('Email wajib diisi'),
        password: !isEdit && !isLengkapi ? Yup.string().required('Password wajib diisi') : Yup.string(),
        nis: Yup.string().required('NIS wajib diisi'),
        kelas: Yup.string().required('Kelas wajib diisi'),
        tanggal_lahir: Yup.string().required('Tanggal Lahir wajib diisi'),
        alamat: Yup.string().required('Alamat wajib diisi'),
    });

    const title = isEdit
        ? `Edit Siswa: ${user?.name || ''}`
        : isLengkapi
        ? `Lengkapi Data Siswa: ${user?.name || ''}`
        : 'Tambah Siswa';

    return (
        <Dialog style={{ minWidth: '50vw' }} header={title} visible={isOpen} onHide={onClose}>
            <Formik
                initialValues={initialValues}
                enableReinitialize
                validationSchema={validationSchema}
                onSubmit={(values, actions) => {
                    const payload = { ...values, role: 'SISWA' };
                    onSubmit(payload);
                    actions.setSubmitting(false);
                }}
            >
                {({ values, handleChange, isSubmitting }) => (
                    <Form>
                        {/* Nama */}
                        <div className="mt-3">
                            <label htmlFor="name">Nama</label>
                            <InputText id="name" name="name" className="w-full mt-2" value={values.name} onChange={handleChange} />
                            <ErrorMessage name="name" component="small" className="p-error" />
                        </div>

                        {/* Email */}
                        <div className="mt-3">
                            <label htmlFor="email">Email</label>
                            <InputText id="email" name="email" className="w-full mt-2" value={values.email} onChange={handleChange} />
                            <ErrorMessage name="email" component="small" className="p-error" />
                        </div>

                        {/* Password hanya saat tambah */}
                        {!isEdit && !isLengkapi && (
                            <div className="mt-3">
                                <label htmlFor="password">Password</label>
                                <InputText id="password" name="password" type="password" className="w-full mt-2" value={values.password} onChange={handleChange} />
                                <ErrorMessage name="password" component="small" className="p-error" />
                            </div>
                        )}

                        {/* Field khusus siswa */}
                        <div className="mt-3">
                            <label htmlFor="nis">NIS</label>
                            <InputText id="nis" name="nis" className="w-full mt-2" value={values.nis} onChange={handleChange} />
                            <ErrorMessage name="nis" component="small" className="p-error" />
                        </div>

                        <div className="mt-3">
                            <label htmlFor="kelas">Kelas</label>
                            <InputText id="kelas" name="kelas" className="w-full mt-2" value={values.kelas} onChange={handleChange} />
                            <ErrorMessage name="kelas" component="small" className="p-error" />
                        </div>

                        <div className="mt-3">
                            <label htmlFor="tanggal_lahir">Tanggal Lahir</label>
                            <InputText id="tanggal_lahir" name="tanggal_lahir" className="w-full mt-2" value={values.tanggal_lahir} onChange={handleChange} />
                            <ErrorMessage name="tanggal_lahir" component="small" className="p-error" />
                        </div>

                        <div className="mt-3">
                            <label htmlFor="alamat">Alamat</label>
                            <InputText id="alamat" name="alamat" className="w-full mt-2" value={values.alamat} onChange={handleChange} />
                            <ErrorMessage name="alamat" component="small" className="p-error" />
                        </div>

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

export default UserFormSiswa;
