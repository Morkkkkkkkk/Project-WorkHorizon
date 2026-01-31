// workhorizon-client/src/components/PromptPayQR.jsx
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import generatePayload from 'promptpay-qr'; // หรือใช้สูตรสร้าง Payload เอง

const PromptPayQR = ({ id, amount }) => {
  // สำหรับโปรเจกต์ ปวส. สามารถใช้ URL สำเร็จรูปเพื่อแสดง QR ง่ายๆ ได้
  // รูปแบบ: https://promptpay.io/{เบอร์โทร}/{ยอดเงิน}.png
  const qrUrl = `https://promptpay.io/${id}/${amount}.png`;

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-lg border-2 border-blue-500 shadow-sm">
      <h4 className="font-bold text-blue-700 mb-2">Thai QR Payment</h4>
      
      {/* แสดงรูป QR Code */}
      <img 
        src={qrUrl} 
        alt="PromptPay QR Code" 
        className="w-48 h-48 mb-3"
      />

      <div className="text-center text-sm">
        <p className="font-semibold">เบอร์ PromptPay: {id}</p>
        <p className="text-red-600 font-bold">ยอดเงิน: ฿{amount}</p>
      </div>
      
      <p className="text-[10px] text-gray-500 mt-2 italic">
        *สแกนได้ด้วยแอปธนาคารทุกแอป
      </p>
    </div>
  );
};

export default PromptPayQR;