import { handleNotification } from "../middleware/midtransService.js";
import * as PembayaranModel from "../models/pembayaranModel.js";

export const midtransNotification = async (req, res) => {
  try {
    const notification = req.body;
    console.log("📨 Midtrans Notification:", notification);

    // Validasi payload
    if (!notification || !notification.order_id) {
      return res.status(400).json({
        status: "99",
        message: "Invalid Midtrans notification payload",
      });
    }

    // Proses notifikasi Midtrans
    const result = await handleNotification(notification);

    // Cari pembayaran berdasarkan MIDTRANS ORDER ID
    const pembayaran =
      await PembayaranModel.getPembayaranByMidtransOrderId(
        result.orderId
      );

    if (!pembayaran) {
      console.warn("⚠️ Pembayaran tidak ditemukan:", result.orderId);
      return res.status(404).json({
        status: "99",
        message: "Pembayaran tidak ditemukan",
      });
    }

    // Update status pembayaran
    await PembayaranModel.updateStatusPembayaran(
      pembayaran.PEMBAYARAN_ID,
      result.status,
      {
        MIDTRANS_TRANSACTION_ID: result.transactionId,
        MIDTRANS_RESPONSE: JSON.stringify(result.rawNotification),
      }
    );

    return res.status(200).json({
      status: "00",
      message: "Midtrans notification processed successfully",
    });
  } catch (err) {
    console.error("❌ Midtrans notification error:", err);
    return res.status(500).json({
      status: "99",
      message: err.message,
    });
  }
};
