import React, { useRef, useEffect, useState } from 'react';
import LanguageSelector from './LanguageSelector.jsx';
import DocumentSelector from './DocumentSelector.jsx';
import DocumentUpload from './DocumentUpload.jsx';
import ProceedScreen from './ProceedScreen.jsx';
import WelcomeConsentScreen from './WelcomeConsentScreen.jsx';
import SessionEndCall from './SessionEndCall.jsx';
import ConsentRecordingScreen from './ConsentRecordingScreen.jsx';
import PersonalDetailsScreen from './PersonalDetailsScreen.jsx';
import PolicyDetailsScreen from './PolicyDetailsScreen.jsx';
import UnderstoodScreen1 from './UnderstoodScreen1.jsx';
import UnderstoodScreen2 from './UnderstoodScreen2.jsx';
import UnderstoodScreen3 from './UnderstoodScreen3.jsx';
import DownloadsScreen from './DownloadsScreen.jsx';
import OtpScreen from './OtpScreen.jsx';
import AcknowledgeScreen from './AcknowledgeScreen.jsx';
import CameraCheckScreen from './CameraCheckScreen.jsx';
import DeclarationScreen from './DeclarationScreen.jsx';
import VoiceChat from './VoiceChat.jsx';

const VIDEO_PARAMS = JSON.stringify({
    autoplay: true,
    resume: false,
    muted: 'false',
    search: false,
    like: false,
    showPlayIconOnMobile: false,
    playercontrols: { hide: 'all' },
    'add-widgets': 'utils,markup,fontloader',
});

const WIDGETS_CONFIG = JSON.stringify({
    markup: {
        list: [
            { start_time: 6,   end_time: 10,   template: '#language-selector',  callback: 'language-selector-callback',       'z-index': '1002' },
            { start_time: 12,  end_time: 15,  template: '#document-selector',  callback: 'document-selector-callback',       'z-index': '1002' },
            { start_time: 17,  end_time: 21,  template: '#document-upload',    callback: 'document-upload-callback',         'z-index': '1002' },
            { start_time: 31,  end_time: 32,  template: '#proceed-screen',     callback: 'proceed-screen-callback',          'z-index': '1002' },
            { start_time: 33,  end_time: 43,  template: '#welcome-consent-screen', callback: 'welcome-consent-callback', 'z-index': '1002' },
            { start_time: 56,  end_time: 80,  template: '#consent-recording-screen', callback: 'consent-recording-callback', 'z-index': '1002' },
            { start_time: 81,  end_time: 82,  template: '#camera-check-trigger', callback: 'camera-check-callback', 'z-index': '1002' },
            { start_time: 120, end_time: 130, template: '#personal-details-screen', callback: 'personal-details-callback', 'z-index': '1002' },
            { start_time: 131, end_time: 149, template: '#policy-details-screen',   callback: 'policy-details-callback',   'z-index': '1002' },
            { start_time: 184, end_time: 185, template: '#understood-screen-1',     callback: 'understood-1-callback',     'z-index': '1002' },
            { start_time: 224, end_time: 225, template: '#understood-screen-2',     callback: 'understood-2-callback',     'z-index': '1002' },
            { start_time: 262, end_time: 263, template: '#understood-screen-3',     callback: 'understood-3-callback',     'z-index': '1002' },
            { start_time: 264, end_time: 294, template: '#downloads-screen',        callback: 'downloads-callback',        'z-index': '1002' },
            { start_time: 295, end_time: 313, template: '#declaration-screen',     callback: 'declaration-callback',      'z-index': '1002' },
            { start_time: 316, end_time: 324, template: '#otp-screen',              callback: 'otp-callback',              'z-index': '1002' },
            { start_time: 325, end_time: 368, template: '#acknowledge-screen',      callback: 'acknowledge-callback',      'z-index': '1002' },
        ],
    },
    fontloader: {
        list: [{ name: 'Open Sans', google: { styles: ['400', '600', '700'] } }],
    },
});

// Exposed player controls for use by other components
let _player = null;
export function seekToTime(sec) {
    if (_player?.seekTo) {
        _player.seekTo(sec * 1000);
        _player.playVideo();
    }
}
export function pausePlayer() {
    if (_player?.pauseVideo) _player.pauseVideo();
}
export function playPlayer() {
    if (_player?.playVideo) _player.playVideo();
}
export function isPlayerPaused() {
    return _player?.getPlayState?.() === 2;
}
let _stopRecordingFn = null;
export function stopRecording() {
    if (_stopRecordingFn) _stopRecordingFn();
}
export function getPlayer() {
    return _player;
}

// --- Helpers ---

function setQueryParam(el) {
    var key = el.getAttribute('data-param-key');
    var value = el.getAttribute('data-param-value');
    if (key && value) {
        var url = new URL(window.location.href);
        url.searchParams.set(key, value);
        window.history.replaceState({}, '', url);
    }
}

export default function VideoPlayer({ videoId }) {
    const videoRef = useRef(null);
    const vid = videoId || 'gcc-5639d983-8489-48c7-8013-3da7dd96f7a3';
    const [showVoiceChat, setShowVoiceChat] = useState(false);
    const voiceChatShownRef = useRef(false);
    const [showCameraCheck, setShowCameraCheck] = useState(false);
    const cameraCheckShownRef = useRef(false);
    const [isRecording, setIsRecording] = useState(false);
    const cameraStreamRef = useRef(null);

    // Expose stop recording for external components
    _stopRecordingFn = () => {
        setIsRecording(false);
        if (cameraStreamRef.current) {
            cameraStreamRef.current.getTracks().forEach(t => t.stop());
            cameraStreamRef.current = null;
        }
    };

    useEffect(() => {
        let player = null;

        // --- KPoint widget callbacks ---

         window['language-selector-callback'] = {
            onRender(self) {
                var $ = $kPointQuery;
                player = self.controller.player;
                _player = player;
                var paused = false;

                // Pause at end of language selector window
                player.addEventListener("timeupdate", function (offset) {
                    if (offset >= 10000 && offset < 11000 && !paused) {
                        player.pauseVideo();
                        paused = true;
                    }
                    // Show voice chat mic from 58s onward
                    if (offset >= 75000 && !voiceChatShownRef.current) {
                        voiceChatShownRef.current = true;
                        setShowVoiceChat(true);
                    }
                });

                // Language button clicks via $kPointQuery (works on cloned elements)
                $("#btn-en").off().on("click", function () {
                    player.seekTo(12000);
                    player.playVideo();
                    paused = false;
                });
                $("#btn-hi").off().on("click", function () {
                    player.seekTo(12000);
                    player.playVideo();
                    paused = false;
                });
                $("#btn-ta").off().on("click", function () {
                    player.seekTo(12000);
                    player.playVideo();
                    paused = false;
                });
                $("#btn-te").off().on("click", function () {
                    player.seekTo(12000);
                    player.playVideo();
                    paused = false;
                });
                $("#btn-mr").off().on("click", function () {
                    player.seekTo(12000);
                    player.playVideo();
                    paused = false;
                });
                $("#btn-bn").off().on("click", function () {
                    player.seekTo(12000);
                    player.playVideo();
                    paused = false;
                });
            },
        };

        window['document-selector-callback'] = {
            onRender(self) {
                var $ = $kPointQuery;
                player = self.controller.player;
                _player = player;
                var paused = false;

                player.addEventListener("timeupdate", function (offset) {
                    if (offset >= 15000 && offset < 16000 && !paused) {
                        player.pauseVideo();
                        paused = true;
                    }
                });

                $("#btn-aadhaar").off().on("click", function () {
                    setQueryParam(this);
                   player.seekTo(17000);
                    player.playVideo();
                    paused = false;
                });
                $("#btn-pan").off().on("click", function () {
                    setQueryParam(this);
                   player.seekTo(17000);
                    player.playVideo();
                    paused = false;
                });
                $("#btn-passport").off().on("click", function () {
                    setQueryParam(this);
                   player.seekTo(17000);
                    player.playVideo();
                    paused = false;
                });
                $("#btn-voterid").off().on("click", function () {
                    setQueryParam(this);
                   player.seekTo(17000);
                    player.playVideo();
                    paused = false;
                });
                $("#btn-dl").off().on("click", function () {
                    setQueryParam(this);
                   player.seekTo(17000);
                    player.playVideo();
                    paused = false;
                });
            },
        };

        window['document-upload-callback'] = {
            onRender(self) {
                var $ = $kPointQuery;
                player = self.controller.player;
                _player = player;
                var paused = false;

                player.addEventListener("timeupdate", function (offset) {
                    if (offset >= 20000 && offset < 21000 && !paused) {
                        player.pauseVideo();
                        paused = true;
                    }
                });

                // Show the correct document image based on URL param
                var url = new URL(window.location.href);
                var docType = url.searchParams.get('document') || 'aadhaar';
                var imgEl = $("#upload-doc-image");
                if (imgEl.length) {
                    imgEl.attr('src', '/images/' + docType + '.png');
                }

                $("#btn-upload-doc").off().on("click", function () {
                    $("#doc-file-input").click();
                });

                $("#doc-file-input").off().on("change", function () {
                    if (this.files && this.files.length > 0) {
                        console.log('Document uploaded:', this.files[0].name);
                        var btn = $("#btn-upload-doc");
                        btn.html('&#10003; Uploaded');
                        btn.removeClass('nav-btn-active')
                        btn.off('click');

                        // Enable Proceed button
                        var proceedBtn = $("#btn-proceed");
                        proceedBtn.removeClass('nav-btn-disabled').addClass('nav-btn-active');
                        proceedBtn.css({ 'pointer-events': 'auto', 'opacity': '1' });
                    }
                });

                $("#btn-proceed").off().on("click", function () {
                    player.seekTo(22000);
                    player.playVideo();
                    paused = false;
                });
            },
        };

        window['proceed-screen-callback'] = {
            onRender(self) {
                var $ = $kPointQuery;
                player = self.controller.player;
                _player = player;
                var paused = false;

                player.addEventListener("timeupdate", function (offset) {
                    if (offset >= 31000 && offset < 32000 && !paused) {
                        player.pauseVideo();
                        paused = true;
                    }
                });

                $("#btn-proceed-screen").off().on("click", function () {
                    player.seekTo(33000);
                    player.playVideo();
                    paused = false;
                });
            },
        };

        window['consent-recording-callback'] = {
            onRender(self) {
                var $ = $kPointQuery;
                player = self.controller.player;
                _player = player;
                var paused = false;

                player.addEventListener("timeupdate", function (offset) {
                    if (offset >= 79000 && offset < 80000 && !paused) {
                        player.pauseVideo();
                        paused = true;
                    }
                });

                // Enable/disable Agree button based on checkbox
                $("#consent-recording-check").off().on("change", function () {
                    var btn = $("#btn-recording-agree");
                    if (this.checked) {
                        btn.removeClass('welcome-btn-disabled');
                        btn.css('pointer-events', 'auto');
                    } else {
                        btn.addClass('welcome-btn-disabled');
                        btn.css('pointer-events', 'none');
                    }
                });

                $("#btn-recording-agree").off().on("click", function () {
                    $("#recording-disagree-card").hide();
                    player.seekTo(81000);
                    player.playVideo();
                    paused = false;
                });

                $("#btn-recording-disagree").off().on("click", function () {
                    player.pauseVideo();
                    $("#consent-recording-main").hide();
                    $("#recording-disagree-card").show();
                });
            },
        };

        window['camera-check-callback'] = {
            onRender(self) {
                player = self.controller.player;
                _player = player;
                if (!cameraCheckShownRef.current) {
                    cameraCheckShownRef.current = true;
                    player.pauseVideo();
                    setShowCameraCheck(true);
                }
            },
        };

        // Personal Details (120-130, pause 130, seek 131)
        window['personal-details-callback'] = {
            onRender(self) {
                var $ = $kPointQuery;
                player = self.controller.player;
                _player = player;
                var paused = false;

                player.addEventListener("timeupdate", function (offset) {
                    if (offset >= 129500 && offset < 130000 && !paused) {
                        player.pauseVideo();
                        paused = true;
                    }
                });

                $("#btn-details-confirm").off().on("click", function () {
                    player.seekTo(131000);
                    player.playVideo();
                    paused = false;
                });

                $("#btn-details-no").off().on("click", function () {
                    player.pauseVideo();
                    $("#personal-details-main").hide();
                    $("#details-wrong-card").show();
                });
            },
        };

        // Policy Details (131-149, pause 149, seek 150)
        window['policy-details-callback'] = {
            onRender(self) {
                var $ = $kPointQuery;
                player = self.controller.player;
                _player = player;
                var paused = false;

                player.addEventListener("timeupdate", function (offset) {
                    if (offset >= 148500 && offset < 149000 && !paused) {
                        player.pauseVideo();
                        paused = true;
                    }
                });

                $("#btn-policy-confirm").off().on("click", function () {
                    player.seekTo(150000);
                    player.playVideo();
                    paused = false;
                });

                $("#btn-policy-no").off().on("click", function () {
                    player.pauseVideo();
                    $("#policy-details-main").hide();
                    $("#policy-wrong-card").show();
                });
            },
        };

        // Understood 1 (3:05-3:06 = 185-186, pause 186, seek 187)
        window['understood-1-callback'] = {
            onRender(self) {
                var $ = $kPointQuery;
                player = self.controller.player;
                _player = player;
                var paused = false;

                player.addEventListener("timeupdate", function (offset) {
                    if (offset >= 185000 && offset < 186000 && !paused) {
                        player.pauseVideo();
                        paused = true;
                    }
                });

                $("#btn-understood-1").off().on("click", function () {
                    player.seekTo(186000);
                    player.playVideo();
                    paused = false;
                });
            },
        };

        // Understood 2 (3:45-3:46 = 225-226, pause 226, seek 227)
        window['understood-2-callback'] = {
            onRender(self) {
                var $ = $kPointQuery;
                player = self.controller.player;
                _player = player;
                var paused = false;

                player.addEventListener("timeupdate", function (offset) {
                    if (offset >= 224000 && offset < 225000 && !paused) {
                        player.pauseVideo();
                        paused = true;
                    }
                });

                $("#btn-understood-2").off().on("click", function () {
                    player.seekTo(226000);
                    player.playVideo();
                    paused = false;
                });
            },
        };

        // Understood 3 (4:22-4:23 = 262-263, pause 263, seek 264)
        window['understood-3-callback'] = {
            onRender(self) {
                var $ = $kPointQuery;
                player = self.controller.player;
                _player = player;
                var paused = false;

                player.addEventListener("timeupdate", function (offset) {
                    if (offset >= 262500 && offset < 263000 && !paused) {
                        player.pauseVideo();
                        paused = true;
                    }
                });

                $("#btn-understood-3").off().on("click", function () {
                    player.seekTo(264000);
                    player.playVideo();
                    paused = false;
                });
            },
        };

        // Downloads (4:24-4:54 = 264-294, pause 294, seek 295)
        window['downloads-callback'] = {
            onRender(self) {
                var $ = $kPointQuery;
                player = self.controller.player;
                _player = player;
                var paused = false;

                player.addEventListener("timeupdate", function (offset) {
                    if (offset >= 293500 && offset < 294000 && !paused) {
                        player.pauseVideo();
                        paused = true;
                    }
                });

                // Force download via JS (KPoint cloning breaks native <a download>)
                function triggerDownload(url, filename) {
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }

                $("#btn-download-policy").off().on("click", function (e) {
                    e.preventDefault();
                    triggerDownload('/docs/policy-document.pdf', 'Policy-Document.pdf');
                });
                $("#btn-download-terms").off().on("click", function (e) {
                    e.preventDefault();
                    triggerDownload('/docs/terms-conditions.pdf', 'Terms-and-Conditions.pdf');
                });
                $("#btn-download-features").off().on("click", function (e) {
                    e.preventDefault();
                    triggerDownload('/docs/key-features.pdf', 'Key-Features-Document.pdf');
                });

                $("#btn-downloads-proceed").off().on("click", function () {
                    player.seekTo(295000);
                    player.playVideo();
                    paused = false;
                });
            },
        };

        // Declaration (4:55-5:13 = 295-313, pause 313, seek 315)
        window['declaration-callback'] = {
            onRender(self) {
                var $ = $kPointQuery;
                player = self.controller.player;
                _player = player;
                var paused = false;
                var recognition = null;
                var transcriptText = '';

                var DECLARATION = "I, Rahul Sharma, confirm that I am purchasing a life insurance policy from Pramerica Life Insurance. I acknowledge that this is not a fixed deposit or savings scheme. I agree to pay a premium of ₹12,500 annually.";

                player.addEventListener("timeupdate", function (offset) {
                    if (offset >= 312500 && offset < 313500 && !paused) {
                        player.pauseVideo();
                        paused = true;

                        // Release audio tracks so SpeechRecognition can use mic (mobile fix)
                        if (cameraStreamRef.current) {
                            cameraStreamRef.current.getAudioTracks().forEach(function(t) { t.stop(); });
                        }

                        // Start speech recognition
                        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                        if (SpeechRecognition) {
                            recognition = new SpeechRecognition();
                            recognition.continuous = true;
                            recognition.interimResults = true;
                            recognition.lang = 'en-IN';

                            recognition.onresult = function (event) {
                                var full = '';
                                for (var i = 0; i < event.results.length; i++) {
                                    if (event.results[i].isFinal) {
                                        full += event.results[i][0].transcript;
                                    }
                                }
                                if (full) {
                                    transcriptText = full;
                                    $("#declaration-transcript").text(full);
                                    var box = $("#declaration-transcript-box");
                                    box.show();
                                    box[0].scrollTop = box[0].scrollHeight;
                                }
                            };

                            recognition.onerror = function (event) {
                                console.warn('Speech recognition error:', event.error);
                                if (event.error === 'no-speech' || event.error === 'aborted' || event.error === 'network') {
                                    setTimeout(function () {
                                        if (recognition && paused) {
                                            try { recognition.start(); } catch (e) {}
                                        }
                                    }, 300);
                                }
                            };

                            recognition.onend = function () {
                                if (recognition && paused) {
                                    setTimeout(function () {
                                        if (recognition && paused) {
                                            try { recognition.start(); } catch (e) {}
                                        }
                                    }, 300);
                                }
                            };

                            recognition.start();
                            $("#declaration-mic-waiting").hide();
                            $("#declaration-listening").show();
                            // Enable the button
                            $("#btn-declaration-done").css({
                                background: '#003d6b',
                                color: '#fff',
                                cursor: 'pointer',
                                pointerEvents: 'auto'
                            }).addClass('hover:bg-[#002d52]');
                        }
                    }
                });

                $("#btn-declaration-done").off().on("click", async function () {
                    try { if (recognition) recognition.stop(); } catch (e) {}

                    if (!transcriptText.trim()) {
                        $("#declaration-message").text('No speech detected. Please read the statement aloud.').css('color', '#dc2626');
                        try { if (recognition) recognition.start(); } catch (e) {}
                        return;
                    }

                    $(this).text('Verifying...').css({ opacity: 0.6, pointerEvents: 'none' });
                    $("#declaration-message").text('').css('color', '');

                    try {
                        var { verifySpeechText } = await import('../services/geminiService.js');
                        var passed = await verifySpeechText(transcriptText, DECLARATION);

                        if (passed) {
                            $("#declaration-message").text('Verification successful!').css('color', '#16a34a');
                            recognition = null;
                            // Stop recording / hide PIP
                            if (typeof _stopRecordingFn === 'function') _stopRecordingFn();
                            setTimeout(function () {
                                player.seekTo(315000);
                                player.playVideo();
                                paused = false;
                            }, 1000);
                        } else {
                            $("#declaration-message").text('Text did not match. Please try again.').css('color', '#dc2626');
                            $(this).text('I Have Read the Statement').css({ opacity: 1, pointerEvents: 'auto' });
                            transcriptText = '';
                            $("#declaration-transcript").text('');
                            $("#declaration-transcript-box").hide();
                            try { if (recognition) recognition.start(); } catch (e) {}
                        }
                    } catch (err) {
                        $("#declaration-message").text('Verification failed. Please try again.').css('color', '#dc2626');
                        $(this).text('I Have Read the Statement').css({ opacity: 1, pointerEvents: 'auto' });
                        try { if (recognition) recognition.start(); } catch (e) {}
                    }
                });
            },
        };

        // OTP (5:16-5:24 = 316-324, pause 324, seek 324)
        window['otp-callback'] = {
            onRender(self) {
                var $ = $kPointQuery;
                player = self.controller.player;
                _player = player;
                var paused = false;
                var attempts = 0;
                var CORRECT_OTP = '0987';

                player.addEventListener("timeupdate", function (offset) {
                    if (offset >= 323500 && offset < 324000 && !paused) {
                        player.pauseVideo();
                        paused = true;
                    }
                });

                $("#btn-send-otp").off().on("click", function () {
                    $("#otp-step-mobile").hide();
                    $("#otp-step-verify").show();
                    $(".otp-box").first().focus();
                });

                $(".otp-box").off().on("input", function () {
                    if ($(this).val().length === 1) {
                        $(this).next(".otp-box").focus();
                    }
                }).on("keydown", function (e) {
                    if (e.key === 'Backspace' && $(this).val() === '') {
                        $(this).prev(".otp-box").focus();
                    }
                });

                $("#btn-verify-otp").off().on("click", function () {
                    var val = '';
                    $(".otp-box").each(function () { val += $(this).val(); });
                    var msg = $("#otp-message");

                    if (val === CORRECT_OTP) {
                        msg.text('OTP verified successfully!').css('color', '#16a34a');
                        $(".otp-box").prop('disabled', true).css('border-color', '#16a34a');
                        $(this).hide();
                        $("#btn-resend-otp").hide();
                        setTimeout(function () {
                            player.seekTo(325000);
                            player.playVideo();
                            paused = false;
                        }, 1000);
                    } else {
                        attempts++;
                        if (attempts >= 3) {
                            msg.text('Too many attempts. Please call 1800-102-7070.').css('color', '#dc2626');
                            $(".otp-box").prop('disabled', true);
                            $(this).hide();
                            $("#btn-resend-otp").hide();
                        } else {
                            msg.text('Incorrect OTP. (' + (3 - attempts) + ' attempts left)').css('color', '#dc2626');
                            $(".otp-box").val('');
                            $(".otp-box").first().focus();
                        }
                    }
                });

                $("#btn-resend-otp").off().on("click", function () {
                    attempts = 0;
                    $(".otp-box").val('').prop('disabled', false);
                    $(".otp-box").first().focus();
                    $("#btn-verify-otp").show();
                    $("#otp-message").text('OTP resent successfully.').css('color', '#0094CA');
                });
            },
        };

        // Acknowledge + Rating (5:25-6:08 = 325-368, pause 368)
        window['acknowledge-callback'] = {
            onRender(self) {
                var $ = $kPointQuery;
                player = self.controller.player;
                _player = player;
                var paused = false;
                var selectedRating = 0;

                player.addEventListener("timeupdate", function (offset) {
                    if (offset >= 367500 && offset < 368000 && !paused) {
                        player.pauseVideo();
                        paused = true;
                    }
                });

                $("#btn-acknowledge").off().on("click", function () {
                    $("#acknowledge-main").hide();
                    $("#rating-view").show();
                });

                $("#star-container .star").off().on("click", function () {
                    var rating = parseInt($(this).attr('data-rating'));
                    selectedRating = rating;
                    $("#star-container .star").each(function (idx) {
                        $(this).css('color', idx < rating ? '#facc15' : '#d1d5db');
                    });
                    $("#rating-msg").text('You rated ' + rating + ' star' + (rating > 1 ? 's' : ''));
                    $("#btn-submit-rating").show();
                });

                $("#star-container .star").on("mouseenter", function () {
                    var rating = parseInt($(this).attr('data-rating'));
                    $("#star-container .star").each(function (idx) {
                        $(this).css('color', idx < rating ? '#facc15' : '#d1d5db');
                    });
                }).on("mouseleave", function () {
                    $("#star-container .star").each(function (idx) {
                        $(this).css('color', idx < selectedRating ? '#facc15' : '#d1d5db');
                    });
                });

                $("#btn-submit-rating").off().on("click", function () {
                    console.log('Rating submitted:', selectedRating);
                    $("#rating-view").hide();
                    $("#thank-you-view").show();
                });
            },
        };

        // --- Cleanup ---
        return () => {
            delete window['language-selector-callback'];
            delete window['document-selector-callback'];
            delete window['document-upload-callback'];
            delete window['proceed-screen-callback'];
            delete window['welcome-consent-callback'];
            delete window['consent-recording-callback'];
            delete window['camera-check-callback'];
            delete window['personal-details-callback'];
            delete window['policy-details-callback'];
            delete window['understood-1-callback'];
            delete window['understood-2-callback'];
            delete window['understood-3-callback'];
            delete window['downloads-callback'];
            delete window['declaration-callback'];
            delete window['otp-callback'];
            delete window['acknowledge-callback'];
        };
    }, []);

    return (
        <>
            <div
                ref={videoRef}
                id="vkyc-video"
                data-video-host="ccoe.kpoint.com"
                data-kvideo-id={vid}
                data-samesite="true"
                data-ar="9:16"
                data-video-params={VIDEO_PARAMS}
                data-personalization-info="{}"
                data-widgets-config={WIDGETS_CONFIG}
                className="kpoint-embedded-video"
                style={{ width: 'min(100vw, calc(100vh * 0.5625))' }}
            />

            {showVoiceChat && !showCameraCheck && <VoiceChat />}
            {showCameraCheck && (
                <CameraCheckScreen
                    onRecordingStarted={(stream) => {
                        cameraStreamRef.current = stream;
                        setIsRecording(true);
                        setShowCameraCheck(false);
                        if (_player?.seekTo) {
                            _player.seekTo(120000);
                            _player.playVideo();
                        }
                    }}
                />
            )}
            {isRecording && !showCameraCheck && (
                <>
                    {/* PIP camera — persists after recording starts */}
                    <div className="absolute top-0 left-0 w-20 h-16 rounded-xl overflow-hidden shadow-lg border-2 border-white/40 z-1001">
                        <video
                            ref={el => {
                                if (el && cameraStreamRef.current && !el.srcObject) {
                                    el.srcObject = cameraStreamRef.current;
                                }
                            }}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                            style={{ transform: 'scaleX(-1)' }}
                        />
                    </div>
                    {/* REC indicator */}
                    <div className="absolute top-1 left-1 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm p-1 rounded-full z-1001">
                        <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                    </div>
                </>
            )}
            <div className="interactive-overlay">
                <LanguageSelector />
                <DocumentSelector />
                <DocumentUpload />
                <ProceedScreen />
                <WelcomeConsentScreen />
                <ConsentRecordingScreen />
                <div id="camera-check-trigger" style={{ display: 'none' }} />
                <PersonalDetailsScreen />
                <PolicyDetailsScreen />
                <UnderstoodScreen1 />
                <UnderstoodScreen2 />
                <UnderstoodScreen3 />
                <DownloadsScreen />
                <DeclarationScreen />
                <OtpScreen />
                <AcknowledgeScreen />
                <SessionEndCall />
            </div>
            
        </>
    );
}
