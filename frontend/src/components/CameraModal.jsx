import { useRef, useEffect, useState } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CameraModal = ({ isOpen, onClose, onCapture, title }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please ensure permissions are granted.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        onCapture(imageData);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-md w-full"
        >
          <div className="p-4 border-bottom flex justify-between items-center bg-denr-green-700 text-white">
            <h3 className="font-semibold flex items-center gap-2">
              <Camera size={18} />
              {title}
            </h3>
            <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
            {error ? (
              <div className="text-white text-center p-6">
                <p className="mb-4">{error}</p>
                <button onClick={startCamera} className="btn-primary">
                  <RefreshCw size={16} /> Retry
                </button>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                {/* Biometric Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-[40px] border-black/40" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-denr-green-500/50 rounded-[3rem] shadow-[0_0_20px_rgba(34,197,94,0.3)]" />
                  <motion.div 
                    animate={{ top: ['20%', '80%', '20%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-1/2 -translate-x-1/2 w-56 h-0.5 bg-denr-green-500 shadow-[0_0_15px_rgba(34,197,94,1)] z-10"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-white font-mono uppercase tracking-widest">Live Feed</span>
                  </div>
                </div>
              </>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          <div className="p-6 flex justify-center">
            <button 
              onClick={capture}
              disabled={!!error}
              className="w-16 h-16 rounded-full bg-denr-green-600 border-4 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              <div className="w-12 h-12 rounded-full border-2 border-white/50" />
            </button>
          </div>
          
          <div className="px-6 pb-6 text-center text-xs text-gray-500">
            Ensure your face/document is clearly visible within the frame.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
