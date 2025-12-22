"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

export default function PaymentFinish() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState("loading");
  const [pembayaran, setPembayaran] = useState(null);

  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (!orderId) return;

    const checkPayment = async () => {
      try {
        const { data } = await axios.get(
          `/api/pembayaran/midtrans/${orderId}`
        );

        setPembayaran(data.data);
        setStatus(data.data.STATUS);
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    };

    // Tunggu webhook Midtrans
    const timer = setTimeout(checkPayment, 2000);
    return () => clearTimeout(timer);
  }, [orderId]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memverifikasi pembayaran...</p>
        </div>
      </div>
    );
  }

  if (status === "SUKSES") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">
            Pembayaran Berhasil!
          </h1>
          <p className="text-gray-600 mb-4">
            Nomor Pembayaran:{" "}
            <strong>{pembayaran?.NOMOR_PEMBAYARAN}</strong>
          </p>
          <p className="text-gray-600 mb-6">
            Total:{" "}
            <strong>
              Rp {Number(pembayaran?.TOTAL_BAYAR || 0).toLocaleString()}
            </strong>
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-yellow-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-yellow-600 mb-2">
            Pembayaran Sedang Diproses
          </h1>
          <p className="text-gray-600 mb-6">
            Mohon tunggu, pembayaran sedang diverifikasi
          </p>
          <button
            onClick={() => router.push("/pembayaran")}
            className="bg-yellow-600 text-white px-6 py-2 rounded hover:bg-yellow-700"
          >
            Lihat Status Pembayaran
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          Pembayaran Gagal
        </h1>
        <p className="text-gray-600 mb-6">
          Silakan coba lagi atau hubungi admin
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}
