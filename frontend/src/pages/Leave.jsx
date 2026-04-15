import React, { useState } from 'react';
import { 
  CalendarDays, 
  FileText, 
  Camera, 
  Upload, 
  History,
  CheckCircle2,
  Clock3,
  XCircle,
  Plus
} from 'lucide-react';
import { CameraModal } from '../components/CameraModal';
import { OCRBox } from '../components/OCRBox';
import { motion } from 'motion/react';

export const Leave = ({ user, leaves = [], onAddLeave }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedDoc, setCapturedDoc] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleCapture = (image) => {
    setCapturedDoc(image);
    setIsOcrLoading(true);
    // Simulate OCR
    setTimeout(() => {
      setOcrText(`DOCUMENT TYPE: MEDICAL CERTIFICATE\nISSUED TO: ${user.name}\nDATE: ${new Date().toLocaleDateString()}\nREMARKS: Fit for work after rest.`);
      setIsOcrLoading(false);
    }, 2000);
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newLeave = {
      userId: user.id || user._id,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      status: 'Pending',
      documentImage: capturedDoc || null,
      ocrText: ocrText || null
    };
    console.log('📝 Submitting leave application:', newLeave);
    if (newLeave.documentImage) {
      console.log('📸 Document size:', Math.round(newLeave.documentImage.length / 1024), 'KB');
    }
    onAddLeave(newLeave);
    setFormData({ type: 'Sick Leave', startDate: '', endDate: '', reason: '' });
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
                <h2 className="text-2xl font-bold text-gray-900">Apply for Leave</h2>
                <p className="text-gray-500">Submit your leave request for approval.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Leave Type</label>
                  <select 
                    className="input-field"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    required
                  >
                    <option>Sick Leave</option>
                    <option>Vacation Leave</option>
                    <option>Maternity/Paternity Leave</option>
                    <option>Emergency Leave</option>
                    <option>Special Privilege Leave</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Start Date</label>
                    <input 
                      type="date" 
                      className="input-field"
                      value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">End Date</label>
                    <input 
                      type="date" 
                      className="input-field"
                      value={formData.endDate}
                      onChange={e => setFormData({...formData, endDate: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Reason / Remarks</label>
                <textarea 
                  className="input-field min-h-[100px]"
                  placeholder="Provide a brief reason for your leave..."
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 block">Supporting Documents (Optional)</label>
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
                Submit Application
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
              <History className="text-denr-green-700" size={20} />
              <h3 className="font-bold text-gray-800">Leave History</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {leaves.length > 0 ? (
                leaves.slice().reverse().map((leave, idx) => (
                  <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-gray-800">{leave.type}</p>
                        <p className="text-xs text-gray-400">{leave.appliedAt ? new Date(leave.appliedAt).toLocaleDateString() : leave.createdAt}</p>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                        leave.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' :
                        leave.status?.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {leave.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <CalendarDays size={14} className="text-gray-400" />
                      <span>{leave.startDate} to {leave.endDate}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 italic">"{leave.reason}"</p>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400 text-sm">
                  No leave applications found.
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
        title="Scan Supporting Document"
      />
    </div>
  );
};
