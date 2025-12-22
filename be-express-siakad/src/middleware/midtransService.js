import midtransClient from "midtrans-client";
import crypto from "crypto";
import moment from "moment-timezone";

// ================================
// ENV CONFIG
// ================================
const {
  MIDTRANS_SERVER_KEY,
  MIDTRANS_CLIENT_KEY,
  MIDTRANS_IS_PRODUCTION,
  FRONTEND_URL,
} = process.env;

if (!MIDTRANS_SERVER_KEY || !MIDTRANS_CLIENT_KEY) {
  throw new Error("❌ MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY wajib diisi di .env");
}

// ================================
// MIDTRANS INSTANCE
// ================================
const snap = new midtransClient.Snap({
  isProduction: MIDTRANS_IS_PRODUCTION === "true",
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

const coreApi = new midtransClient.CoreApi({
  isProduction: MIDTRANS_IS_PRODUCTION === "true",
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

// ================================
// PAYMENT METHOD MAPPING (WAJIB)
// ================================
const PAYMENT_MAP = {
  VA_BCA: "bca_va",
  VA_BNI: "bni_va",
  VA_BRI: "bri_va",
  VA_MANDIRI: "mandiri_va",
  GOPAY: "gopay",
  SHOPEEPAY: "shopeepay",
  QRIS: "qris",
  ALFAMART: "alfamart",
  INDOMARET: "indomaret",
};

// ================================
// SNAP API
// ================================
export const createSnapTransaction = async (orderData) => {
  try {
    const {
      orderId,
      grossAmount,
      customerDetails,
      itemDetails,
      enabledPayments,
      expiryDuration = 24,
    } = orderData;

    // ================================
    // FORMAT WAKTU MIDTRANS (FIX)
    // ================================
    const startTime = moment()
      .tz("Asia/Jakarta")
      .format("YYYY-MM-DD HH:mm:ss Z");

    // ================================
    // NORMALISASI METODE BAYAR
    // ================================
    const normalizedPayments = Array.isArray(enabledPayments)
      ? enabledPayments
          .map((p) => PAYMENT_MAP[p] || p)
          .filter(Boolean)
      : [];

    // ================================
    // SNAP PARAMETER
    // ================================
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: customerDetails.firstName,
        last_name: customerDetails.lastName || "",
        email: customerDetails.email,
        phone: customerDetails.phone,
      },
      item_details: itemDetails,

      // 🔥 FIX UTAMA CHANNEL MIDTRANS
      enabled_payments: normalizedPayments.length
        ? normalizedPayments
        : [
            "credit_card",
            "bca_va",
            "bni_va",
            "bri_va",
            "mandiri_va",
            "gopay",
            "shopeepay",
            "qris",
            "alfamart",
            "indomaret",
          ],

      expiry: {
        start_time: startTime,
        unit: "hours",
        duration: expiryDuration,
      },

      callbacks: {
        finish: `${FRONTEND_URL}/master/pembayaran/payment/PaymentFinish`,
        error: `${FRONTEND_URL}/payment/error`,
        pending: `${FRONTEND_URL}/payment/pending`,
      },
    };

    console.log("🔥 Creating Midtrans transaction:", {
      order_id: orderId,
      gross_amount: grossAmount,
    });

    // ================================
    // CREATE SNAP TRANSACTION
    // ================================
    const transaction = await snap.createTransaction(parameter);

    console.log("✅ Midtrans transaction created:", transaction.token);

    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    };
  } catch (err) {
    console.error("❌ createSnapTransaction:", err);
    throw err;
  }
};

// ================================
// CHECK STATUS
// ================================
export const checkTransactionStatus = async (orderId) => {
  return coreApi.transaction.status(orderId);
};

// ================================
// SIGNATURE VERIFICATION
// ================================
export const verifySignature = (notification) => {
  const { order_id, status_code, gross_amount, signature_key } = notification;

  const hash = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`)
    .digest("hex");

  return hash === signature_key;
};

// ================================
// NOTIFICATION HANDLER
// ================================
export const handleNotification = async (notification) => {
  console.log("🔍 Verifying Midtrans signature...");
  
  if (!verifySignature(notification)) {
    throw new Error("Invalid Midtrans signature");
  }

  console.log("✅ Signature valid");

  const {
    order_id,
    transaction_status,
    fraud_status,
    transaction_id,
  } = notification;

  let status = "PENDING";

  if (transaction_status === "settlement") status = "SUKSES";
  if (transaction_status === "capture" && fraud_status === "accept") status = "SUKSES";
  if (["deny", "cancel", "expire"].includes(transaction_status)) status = "GAGAL";

  console.log(`🎯 Order ${order_id} status: ${transaction_status} → ${status}`);

  return {
    orderId: order_id,
    status,
    transactionId: transaction_id,
    rawNotification: notification,
  };
};

// ================================
// UTILITIES
// ================================
export const cancelTransaction = (orderId) => {
  return coreApi.transaction.cancel(orderId);
};

export const formatOrderId = (nomorPembayaran) => {
  return `${nomorPembayaran}-${Date.now()}`;
};