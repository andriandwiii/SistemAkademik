/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useContext, useState, useEffect } from "react";
import { Chart } from "primereact/chart";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { LayoutContext } from "../../../../layout/context/layoutcontext";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import CustomDataTable from "../../../components/DataTable";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const DashboardTUTAS = () => {
    // Memberikan nilai default {} agar tidak error saat destructuring
    const context = useContext(LayoutContext) || {};
    const layoutConfig = context.layoutConfig || { colorScheme: 'light' };
    
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        summary: { persenHadirSiswa: "0%", totalAgenda: 0, totalGuruHadir: 0 },
        chartData: { labels: [], datasets: [] },
        tabelAgenda: []
    });

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_URL}/dashboard-tu/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data && res.data.success) {
                const result = res.data.data;
                setData({
                    summary: result.summary,
                    chartData: result.chartData,
                    tabelAgenda: result.tabelAgenda
                });
            }
        } catch (err) {
            console.error("Gagal memuat data dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const summaryCards = [
        {
            title: "Presensi Siswa",
            value: data.summary.persenHadirSiswa,
            icon: "pi pi-users",
            color: "bg-green-100 text-green-500",
        },
        {
            title: "Guru Hadir",
            value: `${data.summary.totalGuruHadir} Orang`,
            icon: "pi pi-id-card",
            color: "bg-blue-100 text-blue-500",
        },
        {
            title: "Agenda Mengajar",
            value: `${data.summary.totalAgenda} Jadwal`,
            icon: "pi pi-calendar",
            color: "bg-purple-100 text-purple-500",
        }
    ];

    const siswaAttendanceData = {
        labels: data.chartData.labels?.length > 0 ? data.chartData.labels : ['Belum Ada Data'],
        datasets: [
            {
                data: data.chartData.datasets?.length > 0 ? data.chartData.datasets : [0],
                backgroundColor: ["#22c55e", "#ef4444", "#facc15", "#3b82f6", "#6366f1"],
            },
        ],
    };

    const chartOptions = {
        plugins: {
            legend: {
                labels: {
                    // Penambahan Optional Chaining agar tidak crash jika layoutConfig null
                    color: layoutConfig?.colorScheme === "light" ? "#495057" : "#ebedef",
                },
            },
        },
        maintainAspectRatio: false,
        aspectRatio: 1
    };

    if (loading) {
        return (
            <div className="flex align-items-center justify-content-center" style={{ height: '400px' }}>
                <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s"/>
            </div>
        );
    }

    return (
        <div className="grid">
            {summaryCards.map((card, i) => (
                <div key={i} className="col-12 md:col-4">
                    <div className="card mb-0 shadow-1 border-round-xl border-none surface-card">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">{card.title}</span>
                                <div className="text-900 font-bold text-2xl">{card.value}</div>
                            </div>
                            <div className={`flex align-items-center justify-content-center ${card.color} border-round`} style={{ width: "3rem", height: "3rem" }}>
                                <i className={`${card.icon} text-2xl`} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <div className="col-12 lg:col-6 mt-3">
                <div className="card shadow-1 border-round-xl border-none surface-card">
                    <h5 className="mb-4">Statistik Absensi Siswa</h5>
                    <div className="flex justify-content-center" style={{height: '300px'}}>
                        <Chart type="doughnut" data={siswaAttendanceData} options={chartOptions} style={{ width: '100%' }} />
                    </div>
                </div>
            </div>

            <div className="col-12 lg:col-6 mt-3">
                <div className="card shadow-1 border-round-xl border-none h-full surface-card">
                    <h5 className="mb-4">Informasi Sistem</h5>
                    <div className="p-4 border-round bg-blue-50 text-blue-800 mb-4 border-left-3 border-blue-500">
                        <div className="flex align-items-center">
                            <i className="pi pi-info-circle mr-3 text-2xl"></i>
                            <span className="font-medium">Sistem Monitoring TU Aktif.</span>
                        </div>
                    </div>
                    <div className="surface-ground p-3 border-round">
                        <div className="flex align-items-center justify-content-between">
                            <span className="text-700 font-medium">Status Server</span>
                            <span className="p-tag p-tag-success">Online</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 mt-3">
                <div className="card shadow-1 border-round-xl border-none surface-card">
                    <h5 className="mb-4 font-bold text-xl">Agenda Mengajar Hari Ini</h5>
                    <CustomDataTable 
                        data={data.tabelAgenda} 
                        columns={[
                            { field: "guru", header: "Nama Guru" },
                            { field: "mapel", header: "Mapel" },
                            { field: "kelas", header: "Kelas" },
                            { field: "waktu", header: "Jam" }
                        ]} 
                        paginator rows={5} 
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardTUTAS;