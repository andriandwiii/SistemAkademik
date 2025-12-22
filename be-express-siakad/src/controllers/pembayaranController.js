import * as PembayaranModel from "../models/pembayaranModel.js";
import * as TagihanModel from "../models/tagihansiswaModel.js";
import * as MidtransService from "../middleware/midtransService.js";
import { db } from "../core/config/knex.js";

/**
 * Get all pembayaran
 */
export const getAllPembayaran = async (req, res) => {
  try {
    const { nis, status, metode_bayar, start_date, end_date } = req.query;
    
    const filters = {};
    if (nis) filters.nis = nis;
    if (status) filters.status = status;
    if (metode_bayar) filters.metodeBayar = metode_bayar;
    if (start_date) filters.startDate = start_date;
    if (end_date) filters.endDate = end_date;

    const data = await PembayaranModel.getAllPembayaran(filters);
    
    res.status(200).json({
      status: "00",
      message: "Data pembayaran berhasil diambil",
      total: data.length,
      data
    });
  } catch (err) {
    console.error("❌ Error getAllPembayaran:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Get pembayaran by ID
 */
export const getPembayaranById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await PembayaranModel.getPembayaranById(id);

    if (!data) {
      return res.status(404).json({
        status: "01",
        message: "Pembayaran tidak ditemukan"
      });
    }

    res.status(200).json({
      status: "00",
      message: "Data pembayaran berhasil diambil",
      data
    });
  } catch (err) {
    console.error("❌ Error getPembayaranById:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * 🔥 NEW: Get pembayaran by Midtrans Order ID
 */
export const getPembayaranByMidtransOrderId = async (req, res) => {
  try {
    const { order_id } = req.params;
    
    const pembayaran = await PembayaranModel.getPembayaranByMidtransOrderId(order_id);
    
    if (!pembayaran) {
      return res.status(404).json({
        status: "99",
        message: "Pembayaran tidak ditemukan",
      });
    }
    
    return res.status(200).json({
      status: "00",
      message: "Data pembayaran berhasil diambil",
      data: pembayaran,
    });
  } catch (err) {
    console.error("❌ Error getPembayaranByMidtransOrderId:", err);
    return res.status(500).json({
      status: "99",
      message: err.message,
    });
  }
};

/**
 * Pembayaran Tunai (di loket sekolah)
 */
export const createPembayaranTunai = async (req, res) => {
  try {
    const { NIS, tagihan_ids, petugas_id, keterangan } = req.body;

    if (!NIS || !tagihan_ids || !Array.isArray(tagihan_ids) || tagihan_ids.length === 0) {
      return res.status(400).json({
        status: "99",
        message: "NIS dan tagihan_ids (array) wajib diisi"
      });
    }

    // Hitung total bayar dari tagihan yang dipilih
    let totalBayar = 0;
    const detailTagihan = [];

    for (const tagihanId of tagihan_ids) {
      const tagihan = await TagihanModel.getAllTagihan({ tagihanId });
      if (tagihan && tagihan.length > 0) {
        const t = tagihan[0];
        totalBayar += parseFloat(t.TOTAL);
        detailTagihan.push({
          tagihanId: t.TAGIHAN_ID,
          jumlahBayar: parseFloat(t.TOTAL)
        });
      }
    }

    if (totalBayar === 0) {
      return res.status(400).json({
        status: "99",
        message: "Tidak ada tagihan valid yang dipilih"
      });
    }

    // Create pembayaran
    const pembayaran = await PembayaranModel.createPembayaran(
      {
        NIS,
        TOTAL_BAYAR: totalBayar,
        METODE_BAYAR: "TUNAI",
        STATUS: "SUKSES",
        TGL_BAYAR: new Date(),
        PETUGAS_ID: petugas_id || null,
        KETERANGAN: keterangan || null
      },
      detailTagihan
    );

    res.status(201).json({
      status: "00",
      message: "Pembayaran tunai berhasil dicatat",
      data: pembayaran
    });
  } catch (err) {
    console.error("❌ Error createPembayaranTunai:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Pembayaran Online (via Midtrans)
 * 🔥 UPDATED: Simplified - MIDTRANS_ORDER_ID auto-generated in model
 */
export const createPembayaranOnline = async (req, res) => {
  try {
    const { NIS, tagihan_ids, metode_bayar } = req.body;

    if (!NIS || !tagihan_ids || !Array.isArray(tagihan_ids) || tagihan_ids.length === 0) {
      return res.status(400).json({
        status: "99",
        message: "NIS dan tagihan_ids (array) wajib diisi"
      });
    }

    // Ambil data siswa
    const siswa = await db("master_siswa").where("NIS", NIS).first();
    if (!siswa) {
      return res.status(404).json({
        status: "99",
        message: "Siswa tidak ditemukan"
      });
    }

    // Hitung total dan siapkan item details
    let totalBayar = 0;
    const itemDetails = [];
    const detailTagihan = [];

    for (const tagihanId of tagihan_ids) {
      const tagihanList = await TagihanModel.getAllTagihan({ tagihanId });
      if (tagihanList && tagihanList.length > 0) {
        const t = tagihanList[0];
        totalBayar += parseFloat(t.TOTAL);
        
        itemDetails.push({
          id: t.NOMOR_TAGIHAN,
          price: parseFloat(t.TOTAL),
          quantity: 1,
          name: t.NAMA_KOMPONEN + (t.BULAN ? ` - Bulan ${t.BULAN}` : ""),
        });

        detailTagihan.push({
          tagihanId: t.TAGIHAN_ID,
          jumlahBayar: parseFloat(t.TOTAL)
        });
      }
    }

    if (totalBayar === 0) {
      return res.status(400).json({
        status: "99",
        message: "Tidak ada tagihan valid"
      });
    }

    // 🔥 Create pembayaran record (MIDTRANS_ORDER_ID auto-generated)
    const pembayaran = await PembayaranModel.createPembayaran(
      {
        NIS,
        TOTAL_BAYAR: totalBayar,
        METODE_BAYAR: metode_bayar || "VA_BCA",
        STATUS: "PENDING",
        KETERANGAN: "Pembayaran online via Midtrans"
      },
      detailTagihan
    );

    // 🔥 Use MIDTRANS_ORDER_ID from pembayaran (already generated in model)
    const snapResult = await MidtransService.createSnapTransaction({
      orderId: pembayaran.MIDTRANS_ORDER_ID,
      grossAmount: totalBayar,
      customerDetails: {
        firstName: siswa.NAMA,
        email: siswa.EMAIL || `${NIS}@student.school.com`,
        phone: siswa.NO_TELP || "08123456789",
      },
      itemDetails,
      enabledPayments: metode_bayar ? [metode_bayar] : undefined,
    });

    res.status(201).json({
      status: "00",
      message: "Link pembayaran berhasil dibuat",
      data: {
        pembayaran_id: pembayaran.PEMBAYARAN_ID,
        nomor_pembayaran: pembayaran.NOMOR_PEMBAYARAN,
        midtrans_order_id: pembayaran.MIDTRANS_ORDER_ID,
        total_bayar: totalBayar,
        snap_token: snapResult.token,
        redirect_url: snapResult.redirect_url,
      }
    });
  } catch (err) {
    console.error("❌ Error createPembayaranOnline:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Midtrans Notification Handler
 * 🔥 UPDATED: Better logging
 */
export const handleMidtransNotification = async (req, res) => {
  try {
    const notification = req.body;
    console.log("📨 Midtrans Notification:", JSON.stringify(notification, null, 2));

    // Process notification
    const result = await MidtransService.handleNotification(notification);
    console.log("✅ Processed result:", result);

    // Update pembayaran status
    const pembayaran = await PembayaranModel.getPembayaranByMidtransOrderId(result.orderId);
    console.log("🔍 Found pembayaran:", pembayaran?.PEMBAYARAN_ID || "NOT FOUND");

    if (!pembayaran) {
      console.error("❌ Pembayaran not found for order_id:", result.orderId);
      return res.status(404).json({
        status: "99",
        message: "Pembayaran tidak ditemukan"
      });
    }

    await PembayaranModel.updateStatusPembayaran(
      pembayaran.PEMBAYARAN_ID,
      result.status,
      {
        MIDTRANS_TRANSACTION_ID: result.transactionId,
        MIDTRANS_RESPONSE: JSON.stringify(result.rawNotification),
      }
    );

    console.log(`✅ Pembayaran ${pembayaran.PEMBAYARAN_ID} updated to ${result.status}`);

    // TODO: Kirim notifikasi WhatsApp ke orang tua jika SUKSES
    if (result.status === "SUKSES") {
      console.log("📱 TODO: Send WhatsApp notification");
    }

    res.status(200).json({
      status: "00",
      message: "Notification processed successfully"
    });
  } catch (err) {
    console.error("❌ Error handleMidtransNotification:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Check payment status
 */
export const checkPaymentStatus = async (req, res) => {
  try {
    const { order_id } = req.params;

    const status = await MidtransService.checkTransactionStatus(order_id);

    res.status(200).json({
      status: "00",
      message: "Status pembayaran berhasil diambil",
      data: status
    });
  } catch (err) {
    console.error("❌ Error checkPaymentStatus:", err);
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};

/**
 * Delete pembayaran
 */
export const deletePembayaran = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await PembayaranModel.deletePembayaran(id);

    if (!result) {
      return res.status(404).json({
        status: "01",
        message: "Pembayaran tidak ditemukan"
      });
    }

    res.status(200).json({
      status: "00",
      message: "Pembayaran berhasil dihapus"
    });
  } catch (err) {
    console.error("❌ Error deletePembayaran:", err);
    
    if (err.message.includes("sukses")) {
      return res.status(400).json({
        status: "99",
        message: err.message
      });
    }
    
    res.status(500).json({ 
      status: "99", 
      message: err.message 
    });
  }
};