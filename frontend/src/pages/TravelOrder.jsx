import React, { useState } from 'react';
import { 
  Plane, 
  MapPin, 
  Camera, 
  Upload, 
  History,
  CheckCircle2,
  Clock3,
  XCircle,
  Plus,
  Briefcase,
  FileText,
  Wallet,
  Wrench,
  Calendar
} from 'lucide-react';
import { CameraModal } from '../components/CameraModal';
import { OCRBox } from '../components/OCRBox';
import { motion } from 'motion/react';

export const TravelOrderPage = ({ user, travels = [], onAddTravel }) => {
    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setCapturedDoc(ev.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedDoc, setCapturedDoc] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [formData, setFormData] = useState({
    destination: '',
    purpose: '',
    startDate: '',
    endDate: ''
  });

  const handleCapture = (image) => {
    setCapturedDoc(image);
    setIsOcrLoading(true);
    // Simulate OCR
    setTimeout(() => {
      setOcrText(`TRAVEL ORDER REQUEST\nDESTINATION: ${formData.destination || 'N/A'}\nPURPOSE: ${formData.purpose || 'Official Business'}\nDATES: ${formData.startDate} to ${formData.endDate}\nVERIFIED BY: DENR SYSTEM`);
      setIsOcrLoading(false);
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTravel = {
      userId: user.id || user._id,
      destination: formData.destination,
      purpose: formData.purpose,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: 'Pending',
      documentImage: capturedDoc || null,
      ocrText: ocrText || null
    };
    console.log('📝 Submitting travel order:', newTravel);
    onAddTravel(newTravel);
    setFormData({ 
      destination: '', 
      purpose: '', 
      startDate: '', 
      endDate: ''
    });
    setCapturedDoc(null);
    setOcrText('');
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-denr-green-100 p-2 rounded-xl">
                <Plus className="text-denr-green-700" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Request Travel Order</h2>
                <p className="text-gray-500">Submit supporting documents for official travel.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Destination / Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-denr-green-600" size={20} />
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-denr-green-600 rounded-2xl p-4 pl-12 text-sm transition-all outline-none"
                    placeholder="e.g. Baguio City, Benguet"
                    value={formData.destination}
                    onChange={e => setFormData({...formData, destination: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Travel Duration (Date Range)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider ml-1">Departure Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-denr-green-600" size={16} />
                      <input 
                        type="date" 
                        className="w-full bg-white border border-gray-200 focus:ring-2 focus:ring-denr-green-600 rounded-xl p-3 pl-10 text-sm transition-all outline-none"
                        value={formData.startDate}
                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider ml-1">Return Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-denr-green-600" size={16} />
                      <input 
                        type="date" 
                        className="w-full bg-white border border-gray-200 focus:ring-2 focus:ring-denr-green-600 rounded-xl p-3 pl-10 text-sm transition-all outline-none"
                        value={formData.endDate}
                        onChange={e => setFormData({...formData, endDate: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>



              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Purpose of Travel</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-4 text-denr-green-600" size={20} />
                  <textarea 
                    className="w-full bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-denr-green-600 rounded-2xl p-4 pl-12 text-sm transition-all outline-none min-h-[80px] resize-none"
                    placeholder="Briefly state the purpose of your official travel..."
                    value={formData.purpose}
                    onChange={e => setFormData({...formData, purpose: e.target.value})}
                    required
                  />
                </div>
              </div>



              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 block">Supporting Documents (Invitation, Memo, etc.)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-denr-green-500 hover:text-denr-green-700 hover:bg-denr-green-50 transition-all"
                  >
                    <Camera size={20} />
                    <span className="font-medium">Scan Document</span>
                  </button>
                  <label className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-denr-green-500 hover:text-denr-green-700 hover:bg-denr-green-50 transition-all cursor-pointer">
                    <Upload size={20} />
                    <span className="font-medium">Upload File</span>
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>

                {capturedDoc && (
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200">
                    <img src={capturedDoc} alt="Document" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={() => setCapturedDoc(null)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                <OCRBox text={ocrText} isLoading={isOcrLoading} />
              </div>

              <button type="submit" className="btn-primary w-full py-4 text-lg shadow-lg">
                Submit Travel Request
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
              <History className="text-denr-green-700" size={20} />
              <h3 className="font-bold text-gray-800">Request History</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {travels.length > 0 ? (
                travels.slice().reverse().map((travel, idx) => (
                  <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-gray-800">{travel.destination}</p>
                        <p className="text-xs text-gray-400">{travel.createdAt}</p>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                        travel.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' :
                        travel.status?.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {travel.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <Plane size={14} className="text-gray-400" />
                      <span>{travel.startDate} to {travel.endDate}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 italic">"{travel.purpose}"</p>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400 text-sm">
                  No travel requests found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CameraModal 
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapture}
        title="Scan Travel Documents"
      />
    </div>
  );
};
