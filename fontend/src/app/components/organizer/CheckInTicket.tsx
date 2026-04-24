import { useState } from 'react';
import { QrCode, Keyboard, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

type CheckInMode = 'scan' | 'manual';

interface TicketInfo {
  fullName: string;
  cccd: string;
  ticketType: string;
  eventName: string;
  status: 'valid' | 'used' | 'invalid' | 'expired' | 'not-found';
}

// Mock ticket data
const mockTickets: { [key: string]: TicketInfo } = {
  '123456789012': {
    fullName: 'Nguyen Van A',
    cccd: '123456789012',
    ticketType: 'VIP',
    eventName: 'Lễ Hội Âm Nhạc Mùa Hè 2026',
    status: 'valid',
  },
  '987654321098': {
    fullName: 'Tran Thi B',
    cccd: '987654321098',
    ticketType: 'Thường',
    eventName: 'Hội Thảo Công Nghệ: AI & Machine Learning',
    status: 'used',
  },
  '456789012345': {
    fullName: 'Le Van C',
    cccd: '456789012345',
    ticketType: 'VIP',
    eventName: 'Họp Fan K-Pop 2026',
    status: 'invalid',
  },
  '321098765432': {
    fullName: 'Pham Thi D',
    cccd: '321098765432',
    ticketType: 'Thường',
    eventName: 'Lễ Hội Âm Nhạc Mùa Hè 2026',
    status: 'expired',
  },
};

export function CheckInTicket() {
  const [mode, setMode] = useState<CheckInMode>('scan');
  const [cccdInput, setCccdInput] = useState('');
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleManualCheck = () => {
    setError('');
    setTicketInfo(null);

    if (!cccdInput) {
      setError('Vui lòng nhập CCCD');
      return;
    }

    if (!/^\d{12}$/.test(cccdInput)) {
      setError('CCCD phải là 12 số');
      return;
    }

    const ticket = mockTickets[cccdInput];
    if (ticket) {
      setTicketInfo(ticket);
    } else {
      setTicketInfo({
        fullName: '',
        cccd: cccdInput,
        ticketType: '',
        eventName: '',
        status: 'not-found',
      });
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    setError('');
    setTicketInfo(null);

    // Simulate QR code scan (randomly select a ticket for demo)
    setTimeout(() => {
      const cccdKeys = Object.keys(mockTickets);
      const randomCccd = cccdKeys[Math.floor(Math.random() * cccdKeys.length)];
      const ticket = mockTickets[randomCccd];
      setTicketInfo(ticket);
      setIsScanning(false);
    }, 2000);
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'valid':
        return 'Vé hợp lệ - Cho phép vào';
      case 'used':
        return 'Vé đã được sử dụng';
      case 'invalid':
        return 'Vé không hợp lệ';
      case 'expired':
        return 'Sự kiện đã kết thúc';
      case 'not-found':
        return 'Không tìm thấy sự kiện';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'used':
      case 'expired':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      case 'invalid':
      case 'not-found':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'used':
      case 'expired':
        return <AlertCircle className="w-16 h-16 text-gray-600" />;
      case 'invalid':
      case 'not-found':
        return <XCircle className="w-16 h-16 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mode Tabs */}
      <div className="bg-white rounded-xl shadow-md p-2 flex gap-2">
        <button
          onClick={() => {
            setMode('scan');
            setCccdInput('');
            setTicketInfo(null);
            setError('');
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            mode === 'scan'
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <QrCode className="w-5 h-5" />
          Quét Mã QR
        </button>
        <button
          onClick={() => {
            setMode('manual');
            setCccdInput('');
            setTicketInfo(null);
            setError('');
            setIsScanning(false);
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            mode === 'manual'
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Keyboard className="w-5 h-5" />
          Nhập Thủ Công
        </button>
      </div>

      {/* Scan Mode */}
      {mode === 'scan' && (
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Quét Mã QR</h2>

            {/* Camera Frame UI */}
            <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-6 border-4 border-gray-300">
              {isScanning ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="relative w-full h-full">
                    {/* Scanning Animation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-64 border-4 border-purple-500 rounded-lg animate-pulse" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <QrCode className="w-32 h-32 text-white opacity-50" />
                    </div>
                    <p className="absolute bottom-8 left-0 right-0 text-center text-white font-medium">
                      Đang quét...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-gray-400" />
                </div>
              )}
            </div>

            <button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isScanning ? 'Đang quét...' : 'Bắt Đầu Quét'}
            </button>
          </div>
        </div>
      )}

      {/* Manual Mode */}
      {mode === 'manual' && (
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Kiểm Tra Thủ Công</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhập số CCCD
                </label>
                <input
                  type="text"
                  value={cccdInput}
                  onChange={(e) => {
                    setCccdInput(e.target.value.replace(/\D/g, '').slice(0, 12));
                    setError('');
                    setTicketInfo(null);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleManualCheck();
                    }
                  }}
                  placeholder="123456789012"
                  maxLength={12}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                  } focus:ring-2 focus:border-transparent text-center text-lg font-mono`}
                />
                {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
              </div>

              <button
                onClick={handleManualCheck}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium"
              >
                Kiểm Tra Vé
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Info Result */}
      {ticketInfo && (
        <div className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${getStatusColor(ticketInfo.status)}`}>
          <div className="p-8">
            {/* Status Icon */}
            <div className="flex justify-center mb-6">{getStatusIcon(ticketInfo.status)}</div>

            {/* Status Message */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{getStatusMessage(ticketInfo.status)}</h3>
            </div>

            {/* Ticket Details */}
            {ticketInfo.status !== 'not-found' && (
              <div className="space-y-4 max-w-md mx-auto">
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Họ Tên:</span>
                  <span className="text-gray-900 font-semibold">{ticketInfo.fullName}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">CCCD:</span>
                  <span className="text-gray-900 font-mono">{ticketInfo.cccd}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Loại Vé:</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {ticketInfo.ticketType}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Sự Kiện:</span>
                  <span className="text-gray-900 text-right">{ticketInfo.eventName}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-600 font-medium">Trạng Thái:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      ticketInfo.status === 'valid'
                        ? 'bg-green-100 text-green-800'
                        : ticketInfo.status === 'used' || ticketInfo.status === 'expired'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {ticketInfo.status === 'valid'
                      ? 'Hợp lệ'
                      : ticketInfo.status === 'used'
                      ? 'Đã sử dụng'
                      : ticketInfo.status === 'expired'
                      ? 'Hết hạn'
                      : 'Không hợp lệ'}
                  </span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setTicketInfo(null);
                  setCccdInput('');
                  setError('');
                }}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Kiểm Tra Vé Khác
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium mb-2">Số CCCD Dùng Thử:</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
          <p>• 123456789012 (Hợp lệ)</p>
          <p>• 987654321098 (Đã sử dụng)</p>
          <p>• 456789012345 (Không hợp lệ)</p>
          <p>• 321098765432 (Hết hạn)</p>
        </div>
      </div>
    </div>
  );
}
