import React from 'react';

export default function RatingScreen() {
    return (
        <div id="rating-screen" className="overlay-content">
            <div className="flex flex-col items-center">
                <div className="text-white text-lg font-semibold mb-2 whitespace-nowrap">How was your experience?</div>
                <div className="text-gray-400 text-sm mb-6">Rate your video experience</div>
                <div className="stars" id="star-container">
                    {[1, 2, 3, 4, 5].map(i => (
                        <span key={i} className="star" data-rating={i}>★</span>
                    ))}
                </div>
                <div className="rating-message" id="rating-message"></div>
                <button
                    className="mt-5 px-8 py-3 bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 hover:shadow-emerald-400/40 hover:scale-105 active:scale-95 transition-all duration-200 min-w-[160px]"
                    id="submit-rating-btn"
                    data-action="submit-rating"
                    style={{ display: 'none' }}
                >
                    Submit Rating
                </button>
            </div>
        </div>
    );
}
