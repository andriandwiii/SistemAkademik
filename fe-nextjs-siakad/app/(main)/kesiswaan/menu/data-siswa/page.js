'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import ToastNotifier from '../../../../components/ToastNotifier';
import UserFormModal from './components/SiswaFormModal';
import {
  getUsersByRole,
  createUser,
  updateUser,
  deleteUser,
} from '../../../../(main)/superadmin/menu/users/utils/api';
import CustomDataTable from '../../../../components/DataTable';

export default function SiswaPage() {
  const toastRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogMode, setDialogMode] = useState(null); // 'add' | 'edit' | null
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) window.location.href = '/';
    else setToken(t);
  }, []);

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Ambil hanya siswa
      const res = await getUsersByRole(token, 'SISWA');
      setUsers(res || []);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast('01', 'Gagal memuat data siswa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    if (!dialogMode) return;

    try {
      if (dialogMode === 'add') {
        await createUser(token, data);
        toastRef.current?.showToast('00', 'Siswa berhasil dibuat');
      } else if (dialogMode === 'edit' && selectedUser) {
        await updateUser(token, selectedUser.id, data);
        toastRef.current?.showToast('00', 'Siswa berhasil diupdate');
      }
      fetchUsers();
      setDialogMode(null);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast('01', 'Gagal menyimpan data siswa');
    }
  };

  const handleDelete = (user) => {
    confirmDialog({
      message: `Yakin ingin menghapus siswa "${user.name}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await deleteUser(token, user.id);
          toastRef.current?.showToast('00', 'Siswa berhasil dihapus');
          setUsers((prev) => prev.filter((u) => u.id !== user.id));
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast('01', 'Gagal menghapus siswa');
        }
      },
    });
  };

  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        size="small"
        severity="warning"
        onClick={() => {
          setSelectedUser(rowData);
          setDialogMode('edit');
        }}
      />
      <Button
        icon="pi pi-trash"
        size="small"
        severity="danger"
        onClick={() => handleDelete(rowData)}
      />
    </div>
  );

  // Kolom untuk CustomDataTable
  const userColumns = [
    { field: 'id', header: 'ID', style: { width: '60px' } },
    { field: 'name', header: 'Nama', filter: true },
    { field: 'email', header: 'Email', filter: true },
    {
      field: 'created_at',
      header: 'Dibuat',
      body: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleString() : '-',
    },
    {
      field: 'updated_at',
      header: 'Diperbarui',
      body: (row) =>
        row.updated_at ? new Date(row.updated_at).toLocaleString() : '-',
    },
    {
      header: 'Aksi',
      body: actionBodyTemplate,
      style: { width: '120px' },
    },
  ];

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4">Manajemen Siswa</h3>

      <div className="flex justify-content-end mb-3">
        <Button
          label="Tambah Siswa"
          icon="pi pi-plus"
          onClick={() => {
            setDialogMode('add');
            setSelectedUser(null);
          }}
        />
      </div>

      <CustomDataTable data={users} loading={isLoading} columns={userColumns} />

      <ConfirmDialog />

      <UserFormModal
        isOpen={dialogMode !== null}
        onClose={() => {
          setDialogMode(null);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSubmit={handleSubmit}
        mode={dialogMode}
      />

      <ToastNotifier ref={toastRef} />
    </div>
  );
}
