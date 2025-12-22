import * as TUModel from "../models/dashboardtuModel.js";

export const getDashboardTUData = async (req, res) => {
    try {
        const data = await TUModel.getStatsDashboardTU();
        
        return res.status(200).json({
            success: true,
            message: "Data Dashboard Tata Usaha berhasil dimuat",
            data: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Gagal memuat data dashboard",
            error: error.message
        });
    }
};