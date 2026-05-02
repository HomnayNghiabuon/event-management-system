import client from './client';

/**
 * Gọi lên Backend Java để lấy link thanh toán MoMo
 * @param {number} amount - Số tiền thanh toán
 * @param {string} orderId - Mã đơn hàng từ hệ thống 
 * @param {string} orderDescription 
 */
export const createMoMoPayment = async (amount, orderId, orderDescription = "Thanh toán đơn hàng") => {
    try {
        // Gửi yêu cầu sang Spring Boot (localhost:8081/api/v1/payment/momo)
        const response = await client.post('/payment/momo', {
            amount: amount,
            orderId: orderId,
            orderInfo: orderDescription
        });

        // backend sẽ trả về Object có chứa payUrl
        // Ví dụ: { payUrl: "https://test-payment.momo.vn/..." }
        return response.data; 
    } catch (error) {
        console.error("Lỗi khi gọi API thanh toán MoMo:", error);
        // Ném lỗi ra để ui có thể hiển thị thông báo cho user
        throw error; 
    }
};

/**
 * Check trạng thái đơn hàng nếu cần
 */
export const checkMoMoStatus = async (orderId) => {
    return await client.get(`/payment/momo/status/${orderId}`);
};