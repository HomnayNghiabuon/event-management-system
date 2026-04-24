import { useState, useEffect } from 'react';
import { X, Mail, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalState = 'choice' | 'login' | 'register' | 'otp' | 'success';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const navigate = useNavigate();
  const [state, setState] = useState<ModalState>('choice');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setState('choice');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setOtp('');
        setErrors({});
        setIsSubmitting(false);
        setOtpTimer(60);
        setCanResendOtp(false);
      }, 300);
    }
  }, [isOpen]);

  // OTP countdown timer
  useEffect(() => {
    if (state === 'otp' && otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
  }, [state, otpTimer]);

  const validateEmail = (email: string): boolean => {
    if (!email.includes('@')) {
      setErrors({ email: 'Email không hợp lệ' });
      return false;
    }
    return true;
  };

  const validatePassword = (password: string, isStrong: boolean = false): boolean => {
    if (!password) {
      setErrors({ password: 'Vui lòng nhập mật khẩu' });
      return false;
    }

    if (isStrong) {
      if (password.length < 8) {
        setErrors({ password: 'Mật khẩu phải mạnh hơn (tối thiểu 8 ký tự)' });
        return false;
      }
      if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        setErrors({ password: 'Mật khẩu phải mạnh hơn (cần chữ hoa và số)' });
        return false;
      }
    }

    return true;
  };

  const handleLogin = async () => {
    setErrors({});

    if (!validateEmail(email)) return;
    if (!validatePassword(password)) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Demo account check
    if (email === 'organizer@buyticket.com' && password === '123456') {
      setIsSubmitting(false);
      onClose();
      navigate('/organizer-dashboard');
    } else {
      setIsSubmitting(false);
      setErrors({ general: 'Sai tài khoản hoặc mật khẩu' });
    }
  };

  const handleRegister = async () => {
    setErrors({});

    if (!validateEmail(email)) return;
    if (!validatePassword(password, true)) return;

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Mật khẩu không khớp' });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setState('otp');
    setOtpTimer(60);
    setCanResendOtp(false);
  };

  const handleVerifyOtp = async () => {
    setErrors({});

    if (otp.length !== 6) {
      setErrors({ otp: 'Vui lòng nhập đầy đủ 6 số' });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Demo OTP: 123456
    if (otp === '123456') {
      setIsSubmitting(false);
      setState('success');
    } else {
      setIsSubmitting(false);
      setErrors({ otp: 'OTP không đúng' });
    }
  };

  const handleResendOtp = async () => {
    setOtpTimer(60);
    setCanResendOtp(false);
    setOtp('');
    setErrors({});
  };

  const handleBackToLogin = () => {
    setState('login');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[420px] p-6 animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Cổng Tổ Chức</h2>
          <p className="text-sm text-gray-600 mt-1">Quản lý sự kiện và vé của bạn</p>
        </div>

        {/* Choice State */}
        {state === 'choice' && (
          <div className="space-y-3">
            <button
              onClick={() => setState('login')}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setState('register')}
              className="w-full px-6 py-3 text-purple-600 border-2 border-purple-600 rounded-lg hover:bg-purple-50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium"
            >
              Đăng ký
            </button>
          </div>
        )}

        {/* Login State */}
        {state === 'login' && (
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({});
                  }}
                  placeholder="email.cua.ban@vidu.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                  } focus:ring-2 focus:border-transparent transition-all`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({});
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                  } focus:ring-2 focus:border-transparent transition-all`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">{errors.general}</p>
              </div>
            )}

            {/* Demo Account Hint */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 font-medium mb-1">Tài khoản dùng thử (Demo):</p>
              <p className="text-xs text-blue-700">Ban tổ chức: organizer@buyticket.com / 123456</p>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleLogin}
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
              <button
                onClick={() => setState('choice')}
                className="w-full px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Quay lại
              </button>
            </div>
          </div>
        )}

        {/* Register State */}
        {state === 'register' && (
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({});
                  }}
                  placeholder="email.cua.ban@vidu.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                  } focus:ring-2 focus:border-transparent transition-all`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({});
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                  } focus:ring-2 focus:border-transparent transition-all`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Tối thiểu 8 ký tự, bao gồm chữ hoa và số
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({});
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                  } focus:ring-2 focus:border-transparent transition-all`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleRegister}
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
              <button
                onClick={() => setState('choice')}
                className="w-full px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Quay lại
              </button>
            </div>
          </div>
        )}

        {/* OTP State */}
        {state === 'otp' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">
                Mã OTP đã được gửi về email của bạn
              </p>
              <p className="text-xs text-gray-500 mt-1">{email}</p>
            </div>

            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Nhập mã OTP (6 số)
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                  setErrors({});
                }}
                placeholder="123456"
                maxLength={6}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.otp ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                } focus:ring-2 focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono`}
              />
              {errors.otp && (
                <p className="mt-1 text-sm text-red-600 text-center">{errors.otp}</p>
              )}
            </div>

            {/* Timer and Resend */}
            <div className="text-center">
              {!canResendOtp ? (
                <p className="text-sm text-gray-600">
                  Gửi lại mã sau <span className="font-semibold text-purple-600">{otpTimer}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Gửi lại mã OTP
                </button>
              )}
            </div>

            {/* Demo OTP Hint */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 text-center">OTP dùng thử (Demo): 123456</p>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleVerifyOtp}
                disabled={isSubmitting || otp.length !== 6}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Đang xác thực...' : 'Xác thực OTP'}
              </button>
              <button
                onClick={handleBackToLogin}
                className="w-full px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Quay lại đăng nhập
              </button>
            </div>
          </div>
        )}

        {/* Success State */}
        {state === 'success' && (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h3>
              <p className="text-gray-600">Vui lòng kiểm tra email.</p>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Tài khoản của bạn đang chờ ADMIN xét duyệt trong vòng 2 ngày.
              </p>
            </div>

            <button
              onClick={handleBackToLogin}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium"
            >
              Quay lại đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
