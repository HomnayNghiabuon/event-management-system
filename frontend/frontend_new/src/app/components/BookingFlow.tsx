import { useState } from 'react';
import { X, Plus, Minus, CheckCircle, XCircle, Ticket as TicketIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface BookingFlowProps {
  eventTitle: string;
  ticketTypes: TicketType[];
  onClose: () => void;
}

export function BookingFlow({ eventTitle, ticketTypes, onClose }: BookingFlowProps) {
  const [step, setStep] = useState<'booking' | 'payment' | 'success' | 'failed'>('booking');
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idError, setIdError] = useState('');
  const [regularQuantity, setRegularQuantity] = useState(0);
  const [vipQuantity, setVipQuantity] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get ticket details
  const regularTicket = ticketTypes.find((t) => t.name.includes('Regular')) || ticketTypes[0];
  const vipTicket = ticketTypes.find((t) => t.name.includes('VIP')) || ticketTypes[1];

  // Calculate totals
  const regularSubtotal = regularTicket.price * regularQuantity;
  const vipSubtotal = vipTicket.price * vipQuantity;
  const totalPrice = regularSubtotal + vipSubtotal;
  const totalTickets = regularQuantity + vipQuantity;

  // Selected tickets for summary (only those with quantity > 0)
  const selectedTickets = [
    regularQuantity > 0 && { ticket: regularTicket, quantity: regularQuantity, subtotal: regularSubtotal },
    vipQuantity > 0 && { ticket: vipTicket, quantity: vipQuantity, subtotal: vipSubtotal },
  ].filter(Boolean);

  // Validate ID Number
  const validateIdNumber = (value: string) => {
    if (value.length === 0) {
      setIdError('ID Number is required');
      return false;
    }
    if (!/^\d{12}$/.test(value)) {
      setIdError('ID Number must be exactly 12 digits');
      return false;
    }
    setIdError('');
    return true;
  };

  const handleIdNumberChange = (value: string) => {
    // Only allow digits
    const numericValue = value.replace(/\D/g, '');
    setIdNumber(numericValue);
    if (numericValue.length > 0) {
      validateIdNumber(numericValue);
    }
  };

  const handleProceedToPayment = () => {
    if (!fullName.trim()) {
      alert('Please enter your full name');
      return;
    }
    if (!validateIdNumber(idNumber)) {
      return;
    }
    if (totalTickets === 0) {
      alert('Please select at least one ticket');
      return;
    }
    if (!confirmed) {
      alert('Please confirm that your ticket information is correct');
      return;
    }
    setStep('payment');
  };

  const handleConfirmPayment = () => {
    // Show loading state then demo modal
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowDemoModal(true);
    }, 800);
  };

  const handleDemoSuccess = () => {
    setShowDemoModal(false);
    setStep('success');
    // Auto redirect to homepage after 2-3 seconds
    setTimeout(() => {
      window.location.href = '/';
    }, 2500);
  };

  const handleDemoFailed = () => {
    setShowDemoModal(false);
    setStep('failed');
    // Redirect back to booking form after 3 seconds
    setTimeout(() => {
      setStep('booking');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <AnimatePresence mode="wait">
          {/* STEP 1: Booking Form */}
          {step === 'booking' && (
            <motion.div
              key="booking"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 sm:p-8"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Book Your Ticket</h2>
              <p className="text-gray-600 mb-6">{eventTitle}</p>

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* ID Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ID Number (CCCD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => handleIdNumberChange(e.target.value)}
                    placeholder="Enter 12-digit ID number"
                    maxLength={12}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all ${
                      idError ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {idError && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      {idError}
                    </p>
                  )}
                </div>

                {/* Ticket Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Tickets <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-4">
                    {/* Regular Ticket */}
                    <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{regularTicket.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{regularTicket.description}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              ${regularTicket.price}
                            </span>
                            <span className="text-sm text-gray-500">/ ticket</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 ml-4">
                          <span className="text-xs text-gray-500 font-semibold">Quantity</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setRegularQuantity(Math.max(0, regularQuantity - 1))}
                              disabled={regularQuantity <= 0}
                              className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <Minus className="w-5 h-5 text-gray-600" />
                            </button>
                            <span className="text-2xl font-bold text-gray-900 w-12 text-center">{regularQuantity}</span>
                            <button
                              type="button"
                              onClick={() => setRegularQuantity(Math.min(10, regularQuantity + 1))}
                              disabled={regularQuantity >= 10}
                              className="w-10 h-10 rounded-lg border-2 border-purple-600 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              <Plus className="w-5 h-5 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* VIP Ticket */}
                    <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{vipTicket.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{vipTicket.description}</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              ${vipTicket.price}
                            </span>
                            <span className="text-sm text-gray-500">/ ticket</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-2 ml-4">
                          <span className="text-xs text-gray-500 font-semibold">Quantity</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setVipQuantity(Math.max(0, vipQuantity - 1))}
                              disabled={vipQuantity <= 0}
                              className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <Minus className="w-5 h-5 text-gray-600" />
                            </button>
                            <span className="text-2xl font-bold text-gray-900 w-12 text-center">{vipQuantity}</span>
                            <button
                              type="button"
                              onClick={() => setVipQuantity(Math.min(10, vipQuantity + 1))}
                              disabled={vipQuantity >= 10}
                              className="w-10 h-10 rounded-lg border-2 border-purple-600 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              <Plus className="w-5 h-5 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                    You can select both ticket types at the same time
                  </p>
                </div>

                {/* Ticket Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-purple-200 min-h-[200px]">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TicketIcon className="w-5 h-5 text-purple-600" />
                    Ticket Summary
                  </h3>
                  
                  {selectedTickets.length > 0 ? (
                    <div className="space-y-4 text-sm">
                      {/* Display each selected ticket */}
                      {selectedTickets.map((item: any, index) => (
                        <div key={index} className="pb-3 border-b border-purple-200 last:border-0 last:pb-0">
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold text-gray-900">{item.ticket.name}</span>
                            <span className="text-gray-600">${item.ticket.price} × {item.quantity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-bold text-gray-900">${item.subtotal}</span>
                          </div>
                        </div>
                      ))}
                      
                      {/* Total Price */}
                      <div className="border-t-2 border-purple-300 pt-3 mt-3 flex justify-between items-center">
                        <span className="font-bold text-gray-900 text-base">Total Price:</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ${totalPrice}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-600 pt-2">
                        <span>Total Tickets:</span>
                        <span className="font-semibold">{totalTickets}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                        <TicketIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">No tickets selected</p>
                      <p className="text-gray-400 text-xs mt-1">Select tickets to see your summary</p>
                    </div>
                  )}
                </div>

                {/* Confirmation Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">
                    I confirm that my ticket information is correct <span className="text-red-500">*</span>
                  </span>
                </label>

                {/* Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Ticket information and QR code will be sent via email or available in
                    My Tickets section after payment confirmation.
                  </p>
                </div>

                {/* Proceed Button */}
                <button
                  onClick={handleProceedToPayment}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  Proceed to Payment
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Payment Page */}
          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 sm:p-8"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Payment</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Ticket Summary */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 h-fit">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TicketIcon className="w-5 h-5 text-purple-600" />
                    Order Summary
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Event</p>
                      <p className="font-semibold text-gray-900">{eventTitle}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Full Name</p>
                      <p className="font-semibold text-gray-900">{fullName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">ID Number</p>
                      <p className="font-semibold text-gray-900">{idNumber}</p>
                    </div>

                    {/* Ticket Details */}
                    <div className="border-t border-gray-300 pt-3 mt-3">
                      <p className="text-gray-500 text-xs mb-2">Tickets</p>
                      <div className="space-y-2">
                        {selectedTickets.map((item: any, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-900">{item.ticket.name}</p>
                              <p className="text-xs text-gray-500">${item.ticket.price} × {item.quantity}</p>
                            </div>
                            <p className="font-bold text-gray-900">${item.subtotal}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-300 pt-3 mt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Total Tickets:</span>
                        <span className="font-semibold text-gray-900">{totalTickets}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total Amount:</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ${totalPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Payment Method */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Method</label>
                    <div className="border-2 border-purple-500 bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">M</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">MoMo Wallet</p>
                          <p className="text-sm text-gray-600">Scan QR code to pay</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col items-center">
                      <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <div className="text-center">
                          <div className="w-40 h-40 bg-white border-4 border-gray-300 rounded-lg mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">QR Code</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 text-center">
                        Scan this QR code with your MoMo app to complete payment
                      </p>
                    </div>
                  </div>

                  {/* Bank Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">Bank Transfer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank Name:</span>
                        <span className="font-semibold text-gray-900">Vietcombank</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Number:</span>
                        <span className="font-semibold text-gray-900">1234567890</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Holder:</span>
                        <span className="font-semibold text-gray-900">BuyTicket Co., Ltd</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirm Payment Button */}
                  <button
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                    className={`w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 ${
                      isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      'Confirm Payment'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 sm:p-8 text-center"
            >
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
                <p className="text-gray-600 mb-2">Your ticket has been booked successfully.</p>
                <p className="text-gray-600 mb-6">
                  Ticket details and QR code have been sent to your email.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-800">
                    You will be redirected to the homepage in a few seconds...
                  </p>
                </div>
                <button
                  onClick={() => (window.location.href = '/')}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Back to Homepage
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Failed */}
          {step === 'failed' && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 sm:p-8 text-center"
            >
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h2>
                <p className="text-gray-600 mb-6">
                  Unfortunately, your payment could not be processed. Please try again.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800">
                    If the problem persists, please contact our support team.
                  </p>
                </div>
                <button
                  onClick={() => setStep('payment')}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Demo Payment Result Modal */}
      {showDemoModal && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">💳</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Confirm Payment Result (Demo)
              </h3>
              <p className="text-gray-600 text-sm">
                Choose a result to simulate the payment outcome
              </p>
            </div>

            <div className="space-y-3">
              {/* Success Button */}
              <button
                onClick={handleDemoSuccess}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Payment Successful
              </button>

              {/* Failed Button */}
              <button
                onClick={handleDemoFailed}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Payment Failed
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                This is a demo environment. Select an outcome to continue.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}