'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import ToastNotifier from '../../../../components/ToastNotifier';
import UserFormModal from './components/UserFormModal';
import { getUsers, createUser, updateUser, deleteUser } from './utils/api';
import CustomDataTable from '../../../../components/DataTable'; // <-- pakai custom

export default function UsersPage() {
  const toastRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogMode, setDialogMode] = useState(null); // 'add' | 'edit' | 'lengkapi' | null
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
      const res = await getUsers(token);
      setUsers(res || []);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast('01', 'Gagal memuat data user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    if (!dialogMode) return;

    try {
      if (dialogMode === 'add') {
        await createUser(token, data);
        toastRef.current?.showToast('00', 'User berhasil dibuat');
      } else if ((dialogMode === 'edit' || dialogMode === 'lengkapi') && selectedUser) {
        await updateUser(token, selectedUser.id, data);
        toastRef.current?.showToast('00', 'User berhasil diupdate');
      }
      fetchUsers();
      setDialogMode(null);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      toastRef.current?.showToast('01', 'Gagal menyimpan user');
    }
  };

  const handleDelete = (user) => {
    confirmDialog({
      message: `Yakin ingin menghapus user "${user.name}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Hapus',
      rejectLabel: 'Batal',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await deleteUser(token, user.id);
          toastRef.current?.showToast('00', 'User berhasil dihapus');
          setUsers((prev) => prev.filter((u) => u.id !== user.id));
        } catch (err) {
          console.error(err);
          toastRef.current?.showToast('01', 'Gagal menghapus user');
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
        icon="pi pi-user-edit"
        size="small"
        severity="info"
        onClick={() => {
          setSelectedUser(rowData);
          setDialogMode('lengkapi');
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

  // Definisi kolom untuk CustomDataTable
  const userColumns = [
    { field: 'id', header: 'ID', style: { width: '60px' } },
    { field: 'name', header: 'Name', filter: true },
    { field: 'email', header: 'Email', filter: true },
    { field: 'role', header: 'Role' },
    {
      field: 'created_at',
      header: 'Created At',
      body: (row) => (row.created_at ? new Date(row.created_at).toLocaleString() : '-'),
    },
    {
      field: 'updated_at',
      header: 'Updated At',
      body: (row) => (row.updated_at ? new Date(row.updated_at).toLocaleString() : '-'),
    },
    {
      header: 'Actions',
      body: actionBodyTemplate,
      style: { width: '150px' },
    },
  ];

  return (
    <div className="card p-4">
      <h3 className="text-xl font-semibold mb-4">Manage Users</h3>

      <div className="flex justify-content-end mb-3">
        <Button
          label="Tambah User"
          icon="pi pi-plus"
          onClick={() => {
            setDialogMode('add');
            setSelectedUser(null);
          }}
        />
      </div>

      {/* Gunakan CustomDataTable */}
      <CustomDataTable data={users} loading={isLoading} columns={userColumns} />

      <ConfirmDialog />

      {/* Dialog Add/Edit/Lengkapi */}
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
