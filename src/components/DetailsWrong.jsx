import React from 'react';
import WhatsAppIcon from './WhatsAppIcon.jsx';

export default function DetailsWrong() {
    return (
        <div id="details-wrong" className="fullscreen-overlay">
            <div className="close-icon" data-action="close-details-wrong"></div>
            <div className="end-session">
                <p>Please contact us to correct your details:</p>
                <div className="phone-number">1800-102-7070</div>
                <div className="contact-icons">
                    <a href="tel:18001027070" className="contact-icon" title="Call">📞</a>
                    <a href="https://wa.me/18001027070" className="contact-icon whatsapp" target="_blank" rel="noopener noreferrer" title="WhatsApp">
                        <WhatsAppIcon />
                    </a>
                </div>
            </div>
        </div>
    );
}
