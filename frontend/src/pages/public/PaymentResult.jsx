import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function PaymentResult() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); 

  useEffect(() => {
    const resultCode = params.get("resultCode");
    const orderId = params.get("orderId");

    console.log("MoMo resultCode:", resultCode);
    console.log("OrderId:", orderId);

    
    if (!resultCode) {
      console.log("Không có resultCode → fallback success");


      setTimeout(() => {
        setStatus("success");
      }, 1500);

      return;
    }


    if (resultCode === "0") {
      setStatus("success");
    } else {
      setStatus("fail");
    }

  }, [params]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      
      {/* 🔄 Loading */}
      {status === "loading" && (
        <>
          <h2>⏳ Đang xử lý thanh toán...</h2>
          <p>Vui lòng chờ trong giây lát</p>
        </>
      )}

      {/*  Success */}
      {status === "success" && (
        <>
          <h2 style={{ color: "green" }}>✅ Thanh toán thành công</h2>
          <p>Cảm ơn bạn đã sử dụng dịch vụ!</p>
        </>
      )}

      {/*  Fail */}
      {status === "fail" && (
        <>
          <h2 style={{ color: "red" }}>❌ Thanh toán thất bại</h2>
          <p>Vui lòng thử lại hoặc chọn phương thức khác</p>
        </>
      )}

      <div style={{ marginTop: "30px" }}>
        <button onClick={() => navigate("/")}>
          Về trang chủ
        </button>
      </div>

      {/*  NÚT FAKE (dùng khi sandbox không redirect) */}
      {status === "loading" && (
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() =>
              navigate("/payment-result?resultCode=0")
            }
          >
            👉 Giả lập thanh toán thành công
          </button>
        </div>
      )}
    </div>
  );
}

export default PaymentResult;