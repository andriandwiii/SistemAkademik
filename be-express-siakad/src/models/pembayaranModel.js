import { db } from "../core/config/knex.js";

const table = "pembayaran";

/**
 * Get all pembayaran with filters
 */
export const getAllPembayaran = async (filters = {}) => {
  let query = db(`${table} as p`)
    .leftJoin("master_siswa as s", "p.NIS", "s.NIS")
    .select(
      "p.*",
      "s.NAMA as NAMA_SISWA",
      "s.NO_TELP"
    );

  if (filters.nis) query.where("p.NIS", filters.nis);
  if (filters.status) query.where("p.STATUS", filters.status);
  if (filters.metodeBayar) query.where("p.METODE_BAYAR", filters.metodeBayar);
  if (filters.startDate) query.where("p.TGL_BAYAR", ">=", filters.startDate);
  if (filters.endDate) query.where("p.TGL_BAYAR", "<=", filters.endDate);

  return query.orderBy("p.created_at", "desc");
};

/**
 * Get pembayaran by ID with details
 */
export const getPembayaranById = async (pembayaranId) => {
  const pembayaran = await db(`${table} as p`)
    .leftJoin("master_siswa as s", "p.NIS", "s.NIS")
    .select(
      "p.*",
      "s.NAMA as NAMA_SISWA",
      "s.NO_TELP",
      "s.EMAIL"
    )
    .where("p.PEMBAYARAN_ID", pembayaranId)
    .first();

  if (!pembayaran) return null;

  // Get detail pembayaran
  const details = await db("detail_pembayaran as dp")
    .leftJoin("tagihan_siswa as t", "dp.TAGIHAN_ID", "t.TAGIHAN_ID")
    .leftJoin("master_komponen_biaya as k", "t.KOMPONEN_ID", "k.KOMPONEN_ID")
    .select(
      "dp.*",
      "t.NOMOR_TAGIHAN",
      "t.BULAN",
      "t.TAHUN",
      "k.NAMA_KOMPONEN",
      "k.JENIS_BIAYA"
    )
    .where("dp.PEMBAYARAN_ID", pembayaranId);

  return {
    ...pembayaran,
    DETAIL: details
  };
};

/**
 * Create pembayaran with details
 * 🔥 UPDATED: Auto-generate MIDTRANS_ORDER_ID
 */
export const createPembayaran = async (data, detailTagihan) => {
  return db.transaction(async (trx) => {
    // 1. Generate ID
    const lastPembayaran = await trx(table)
      .select("PEMBAYARAN_ID")
      .orderBy("id", "desc")
      .first()
      .forUpdate();

    let nextNumber = 1;
    if (lastPembayaran && lastPembayaran.PEMBAYARAN_ID) {
      const numericPart = parseInt(lastPembayaran.PEMBAYARAN_ID.replace("PAY", ""), 10);
      if (!isNaN(numericPart)) nextNumber = numericPart + 1;
    }
    const pembayaranId = `PAY${nextNumber.toString().padStart(10, "0")}`;
    const nomorPembayaran = `RCP${nextNumber.toString().padStart(10, "0")}`;

    // 🔥 GENERATE MIDTRANS ORDER ID
    const midtransOrderId = `${nomorPembayaran}-${Date.now()}`;

    // 2. Insert pembayaran
    const [id] = await trx(table).insert({
      ...data,
      PEMBAYARAN_ID: pembayaranId,
      NOMOR_PEMBAYARAN: nomorPembayaran,
      MIDTRANS_ORDER_ID: midtransOrderId, // 🔥 AUTO GENERATED
    });

    // 3. Insert detail pembayaran dan update tagihan
    for (const detail of detailTagihan) {
      // Generate DETAIL_ID
      const lastDetail = await trx("detail_pembayaran")
        .select("DETAIL_ID")
        .orderBy("id", "desc")
        .first();

      let nextDetailNum = 1;
      if (lastDetail && lastDetail.DETAIL_ID) {
        const numPart = parseInt(lastDetail.DETAIL_ID.replace("DTL", ""), 10);
        if (!isNaN(numPart)) nextDetailNum = numPart + 1;
      }
      const detailId = `DTL${nextDetailNum.toString().padStart(10, "0")}`;

      await trx("detail_pembayaran").insert({
        DETAIL_ID: detailId,
        PEMBAYARAN_ID: pembayaranId,
        TAGIHAN_ID: detail.tagihanId,
        JUMLAH_BAYAR: detail.jumlahBayar
      });

      // Update status tagihan (hanya jika pembayaran SUKSES)
      if (data.STATUS === "SUKSES") {
        const tagihan = await trx("tagihan_siswa")
          .where("TAGIHAN_ID", detail.tagihanId)
          .first();

        const totalBayarResult = await trx("detail_pembayaran")
          .where("TAGIHAN_ID", detail.tagihanId)
          .sum("JUMLAH_BAYAR as total")
          .first();

        const totalBayar = totalBayarResult.total || 0;

        let status = "BELUM_BAYAR";
        let tglLunas = null;

        if (totalBayar >= tagihan.TOTAL) {
          status = "LUNAS";
          tglLunas = new Date();
        } else if (totalBayar > 0) {
          status = "SEBAGIAN";
        }

        await trx("tagihan_siswa")
          .where("TAGIHAN_ID", detail.tagihanId)
          .update({ STATUS: status, TGL_LUNAS: tglLunas });
      }
    }

    // 🔥 RETURN COMPLETE DATA
    return trx(table).where("id", id).first();
  });
};

/**
 * Update pembayaran status
 */
export const updateStatusPembayaran = async (pembayaranId, status, midtransData = {}) => {
  return db.transaction(async (trx) => {
    const updateData = {
      STATUS: status,
      ...midtransData
    };

    if (status === "SUKSES" && !updateData.TGL_BAYAR) {
      updateData.TGL_BAYAR = new Date();
    }

    await trx(table).where("PEMBAYARAN_ID", pembayaranId).update(updateData);

    // Jika status berubah menjadi SUKSES, update status tagihan
    if (status === "SUKSES") {
      // Ambil semua detail pembayaran
      const details = await trx("detail_pembayaran")
        .where("PEMBAYARAN_ID", pembayaranId)
        .select("TAGIHAN_ID", "JUMLAH_BAYAR");

      // Update status setiap tagihan
      for (const detail of details) {
        const tagihan = await trx("tagihan_siswa")
          .where("TAGIHAN_ID", detail.TAGIHAN_ID)
          .first();

        const totalBayarResult = await trx("detail_pembayaran")
          .where("TAGIHAN_ID", detail.TAGIHAN_ID)
          .sum("JUMLAH_BAYAR as total")
          .first();

        const totalBayar = totalBayarResult.total || 0;

        let newStatus = "BELUM_BAYAR";
        let tglLunas = null;

        if (totalBayar >= tagihan.TOTAL) {
          newStatus = "LUNAS";
          tglLunas = new Date();
        } else if (totalBayar > 0) {
          newStatus = "SEBAGIAN";
        }

        await trx("tagihan_siswa")
          .where("TAGIHAN_ID", detail.TAGIHAN_ID)
          .update({ STATUS: newStatus, TGL_LUNAS: tglLunas });
      }
    }

    return trx(table).where("PEMBAYARAN_ID", pembayaranId).first();
  });
};

/**
 * Get pembayaran by Midtrans Order ID
 */
export const getPembayaranByMidtransOrderId = async (orderId) => {
  return db(table).where("MIDTRANS_ORDER_ID", orderId).first();
};

/**
 * Delete pembayaran (only if PENDING/GAGAL)
 */
export const deletePembayaran = async (pembayaranId) => {
  const pembayaran = await db(table).where("PEMBAYARAN_ID", pembayaranId).first();
  
  if (!pembayaran) return null;
  
  if (pembayaran.STATUS === "SUKSES") {
    throw new Error("Tidak dapat menghapus pembayaran yang sudah sukses");
  }

  // Delete detail first (CASCADE should handle this, but just in case)
  await db("detail_pembayaran").where("PEMBAYARAN_ID", pembayaranId).del();
  
  // Delete pembayaran
  await db(table).where("PEMBAYARAN_ID", pembayaranId).del();
  
  return pembayaran;
};

/**
 * Get pembayaran summary by date range
 */
export const getPembayaranSummary = async (startDate, endDate, status = "SUKSES") => {
  const result = await db(table)
    .where("STATUS", status)
    .whereBetween("TGL_BAYAR", [startDate, endDate])
    .select(
      db.raw("COUNT(*) as total_transaksi"),
      db.raw("SUM(TOTAL_BAYAR) as total_nominal"),
      db.raw("COUNT(DISTINCT NIS) as total_siswa")
    )
    .first();

  return result;
};

/**
 * Get pembayaran by metode
 */
export const getPembayaranByMetode = async (startDate, endDate) => {
  return db(table)
    .where("STATUS", "SUKSES")
    .whereBetween("TGL_BAYAR", [startDate, endDate])
    .select("METODE_BAYAR")
    .count("* as jumlah")
    .sum("TOTAL_BAYAR as total")
    .groupBy("METODE_BAYAR")
    .orderBy("total", "desc");
};