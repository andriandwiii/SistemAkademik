'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { getUsers } from "../../superadmin/menu/users/utils/api"; // sesuaikan path
import { InputText } from 'primereact/inputtext'; // Tambahkan InputText

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        roles: {}
    });

    // Chart data (dipindahkan ke sini agar menggunakan state stats terbaru)
    const userRoleData = {
        labels: Object.keys(stats.roles),
        datasets: [
            {
                label: 'Users per Role',
                backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#FF7043', '#26A69A'],
                data: Object.values(stats.roles),
            },
        ],
    };
    const chartOptions = { plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false };

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedName = localStorage.getItem("name");

        if (!token) {
            router.push("/"); // redirect ke login jika belum login
        } else {
            if (storedName) setName(storedName);
            fetchStats(token);
        }
    }, [router]);

    const fetchStats = async (token) => {
        setLoading(true);
        try {
            // Asumsi getUsers mengembalikan array objek user
            const users = await getUsers(token); 
            const total = users.length;
            
            // Asumsi: user dianggap aktif jika properti is_active tidak secara eksplisit false
            const active = users.filter(u => u.is_active !== false).length; 
            const inactive = total - active;

            const roles = {};
            users.forEach(u => {
                // Asumsi properti role ada pada objek user
                const roleName = u.role || 'Unassigned'; 
                roles[roleName] = (roles[roleName] || 0) + 1;
            });

            setStats({ totalUsers: total, activeUsers: active, inactiveUsers: inactive, roles });
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="h-screen flex justify-center items-center text-xl">Loading...</div>;

    return (
        <div className="grid p-fluid">
            
            {/* Summary cards - Menggunakan style card dari contoh Keuangan */}
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2"> {/* Mengganti Card PrimeReact dengan div class="card" */}
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Total Pengguna</span>
                            <div className="text-900 font-medium text-xl">{stats.totalUsers}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-users text-blue-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Semua akun pengguna terdaftar</small>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2">
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Pengguna Aktif</span>
                            <div className="text-900 font-medium text-xl">{stats.activeUsers}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-check-circle text-green-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Akun yang dapat login</small>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2">
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Pengguna Nonaktif</span>
                            <div className="text-900 font-medium text-xl">{stats.inactiveUsers}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-red-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-times-circle text-red-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Akun yang dinonaktifkan</small>
                </div>
            </div>

            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-2">
                    <div className="flex justify-content-between">
                        <div>
                            <span className="block text-500 font-medium mb-2">Selamat Datang,</span>
                            <div className="text-900 font-bold text-xl">{name}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-indigo-100 border-round" style={{ width: '3rem', height: '3rem' }}>
                            <i className="pi pi-briefcase text-indigo-600 text-xl" />
                        </div>
                    </div>
                    <small className="text-500">Anda adalah Superadmin</small>
                </div>
            </div>
            
            {/* Controls / Filter Section - Mengikuti layout Keuangan */}
            <div className="col-12">
                <div className="card mb-2">
                    <div className="flex align-items-center justify-content-between">
                        <div className="flex align-items-center gap-3">
                            <InputText placeholder="Cari pengguna..." disabled /> {/* Contoh InputText */}
                        </div>

                        <div className="flex gap-2">
                            <Button 
                                label="Manage Users" 
                                icon="pi pi-users" 
                                className="p-button-sm p-button-info" 
                                onClick={() => router.push('/superadmin/menu/users')} 
                            />
                            <Button 
                                label="Add User" 
                                icon="pi pi-plus" 
                                className="p-button-sm p-button-success" 
                                onClick={() => router.push('/superadmin/menu/users')} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Users by Role - Menggunakan layout yang lebih besar */}
            <div className="col-12 md:col-6">
                <div className="card">
                    <h5 className="mb-3">Distribusi Pengguna Berdasarkan Peran (Role)</h5>
                    <div className="flex justify-content-center" style={{ height: '300px' }}>
                        {Object.keys(stats.roles).length > 0 ? (
                            <Chart type="doughnut" data={userRoleData} options={chartOptions} />
                        ) : (
                            <div className="flex align-items-center justify-content-center h-full text-500">No role data available.</div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Quick Info & Tips - Diletakkan di samping chart */}
            <div className="col-12 md:col-6 grid">
                <div className="col-12">
                    <div className="card"> {/* Menggunakan div class="card" */}
                        <h5 className="mb-2">Informasi Cepat</h5>
                        <p>Total {stats.totalUsers} pengguna terdaftar dengan {stats.activeUsers} akun aktif saat ini.</p>
                        <Button 
                            label="Lihat Detail Statistik" 
                            icon="pi pi-chart-bar" 
                            className="p-button-sm p-button-secondary w-full mt-3" 
                            onClick={() => console.log('Implement detail stats page')} 
                        />
                    </div>
                </div>

                <div className="col-12">
                    <div className="card">
                        <h5 className="mb-2">Tips Admin</h5>
                        <p className="text-sm text-500">Periksa data pengguna secara berkala dan pastikan semua akun memiliki peran yang tepat untuk keamanan sistem.</p>
                    </div>
                </div>
            </div>
            
            {/* Bagian kosong atau tambahan lain jika diperlukan */}
            <div className="col-12">
                <div className="card">
                    <h5 className="mb-2">Laporan Terbaru (Placeholder)</h5>
                    <p className="text-500">Tambahkan tabel atau grafik tren data lain di sini.</p>
                </div>
            </div>
        </div>
    );
}