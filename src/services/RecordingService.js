export class RecordingService {
    constructor() {
        this.mediaStream = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];
    }

    async requestCamera() {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: true
        });
        return this.mediaStream;
    }

    startRecording() {
        if (!this.mediaStream) return;

        this.recordedChunks = [];
        const options = { mimeType: 'video/webm;codecs=vp9' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/webm';
        }

        this.mediaRecorder = new MediaRecorder(this.mediaStream, options);

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };

        this.mediaRecorder.start();
        console.log('Recording started');
    }

    stopRecording() {
        return new Promise((resolve) => {
            if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
                resolve(null);
                return;
            }

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
                console.log('Recording stopped. Blob size:', blob.size);

                // TODO: Upload the blob to your server
                // const formData = new FormData();
                // formData.append('video', blob, 'vkyc-recording.webm');
                // fetch('/api/upload-vkyc', { method: 'POST', body: formData });

                this.stopCamera();
                resolve(blob);
            };

            this.mediaRecorder.stop();
        });
    }

    isRecording() {
        return this.mediaRecorder && this.mediaRecorder.state === 'recording';
    }

    stopCamera() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
    }

    getStream() {
        return this.mediaStream;
    }

    getCameraErrorMessage(error) {
        const messages = {
            NotAllowedError: 'Please allow camera and microphone permissions in your browser settings and try again.',
            NotFoundError: 'No camera found on your device.',
            NotReadableError: 'Camera is already in use by another application. Please close other apps using the camera.',
            OverconstrainedError: 'Camera does not meet the required specifications.',
            SecurityError: 'Camera access requires HTTPS. Please access this page via a secure connection.'
        };
        return 'Unable to access camera. ' + (messages[error.name] || 'Error: ' + error.message);
    }
}
