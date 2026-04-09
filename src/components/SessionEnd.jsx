import React from 'react';
import WhatsAppIcon from './WhatsAppIcon.jsx';

export default function SessionEnd() {
    return (
        <div id="session-end" className="fullscreen-overlay">
            <div className="flex flex-col items-center text-center text-white px-6 py-10 max-w-sm">
                <p className="text-lg mb-4">We'd love to hear your feedback</p>
                <textarea
                    id="disagree-feedback"
                    className="w-full p-3 mb-5 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-white/50 resize-y min-h-[80px] focus:outline-none focus:border-white/40"
                    placeholder="Please share why you chose to disagree (optional)"
                />
                <button
                    id="submit-feedback-btn"
                    className="px-8 py-3 mb-8 bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 hover:shadow-emerald-400/40 hover:scale-105 active:scale-95 transition-all duration-200 min-w-[180px]"
                    data-action="submit-feedback"
                >
                    Submit Feedback
                </button>

                <p className="mt-2 text-white/80">Or contact us for assistance:</p>
                <div className="text-xl font-bold text-emerald-400 mt-2">1800-102-7070</div>
                <div className="flex gap-4 mt-4">
                    <a href="tel:18001027070" className="contact-icon" title="Call">📞</a>
                    <a href="https://wa.me/18001027070" className="contact-icon whatsapp" target="_blank" rel="noopener noreferrer" title="WhatsApp">
                        <WhatsAppIcon />
                    </a>
                </div>
                <button
                    className="mt-8 px-8 py-3 bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 hover:shadow-emerald-400/40 hover:scale-105 active:scale-95 transition-all duration-200 min-w-[200px]"
                    data-action="restart"
                >
                    Restart the Session
                </button>
            </div>
        </div>
    );
}
