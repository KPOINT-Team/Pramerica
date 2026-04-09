import React from 'react';

export default function OtpScreen() {
    return (
        <div id="otp-screen" style={{ display: 'none' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto px-3">
                <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.15)] w-[90%] max-w-sm p-3">
                    {/* Step 1: Mobile number */}
                    <div id="otp-step-mobile">
                        <p className="text-[#003d6b] font-bold text-center mb-1" style={{ fontSize: 'calc(4.5 * var(--pw))' }}>
                            Verify Your Identity
                        </p>
                        <p className="text-gray-500 text-center mb-2" style={{ fontSize: 'calc(4 * var(--pw))' }}>
                            Enter your registered mobile number
                        </p>
                        <input
                            style={{ fontSize: 'calc(4 * var(--pw))' }}
                            type="tel"
                            placeholder='Enter Mobile Number'
                            id="mobile-input"
                            className="w-full text-center  border border-gray-200 bg-gray-50 rounded-lg text-gray-900 mb-3 tracking-wide py-1"
                        />
                        <div id="btn-send-otp" className="bg-[#003d6b] text-white  text-center py-2.5 rounded-lg cursor-pointer hover:bg-[#002d52] transition-colors" style={{ fontSize: 'calc(4 * var(--pw))' }}>
                            Send OTP
                        </div>
                    </div>

                    {/* Step 2: OTP entry */}
                    <div id="otp-step-verify" style={{ display: 'none' }}>
                        <p className="text-[#003d6b] font-bold text-center mb-2" style={{ fontSize: 'calc(5 * var(--pw))' }}>
                            Enter OTP
                        </p>
                        <div className="flex justify-center gap-2 mb-2" id="otp-boxes">
                            <input style={{ fontSize: 'calc(5 * var(--pw))' }} type="text" maxLength="1" className="otp-box w-10 h-10 text-center font-bold border border-gray-300 rounded-lg text-gray-900 focus:border-[#003d6b] focus:outline-none transition-colors" />
                            <input style={{ fontSize: 'calc(5 * var(--pw))' }} type="text" maxLength="1" className="otp-box w-10 h-10 text-center font-bold border border-gray-300 rounded-lg text-gray-900 focus:border-[#003d6b] focus:outline-none transition-colors" />
                            <input style={{ fontSize: 'calc(5 * var(--pw))' }} type="text" maxLength="1" className="otp-box w-10 h-10 text-center font-bold border border-gray-300 rounded-lg text-gray-900 focus:border-[#003d6b] focus:outline-none transition-colors" />
                            <input style={{ fontSize: 'calc(5 * var(--pw))' }} type="text" maxLength="1" className="otp-box w-10 h-10 text-center font-bold border border-gray-300 rounded-lg text-gray-900 focus:border-[#003d6b] focus:outline-none transition-colors" />
                        </div>
                        <p id="otp-message" className="text-center mb-2 min-h-4" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>&nbsp;</p>
                        <div className="flex gap-2">
                            <div id="btn-verify-otp" className="flex-1 bg-[#003d6b] text-white text-center py-2.5 rounded-lg cursor-pointer hover:bg-[#002d52] transition-colors" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>
                                Verify
                            </div>
                            <div id="btn-resend-otp" className="flex-1 bg-transparent text-gray-700 text-center py-2.5 rounded-lg cursor-pointer border border-gray-300 hover:bg-gray-50 transition-colors" style={{ fontSize: 'calc(3.5 * var(--pw))' }}>
                                Resend
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
