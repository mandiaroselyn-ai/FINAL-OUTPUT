import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const OCRBox = ({ text, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mt-4 p-4 border border-denr-green-100 bg-denr-green-50 rounded-lg animate-pulse">
        <div className="h-4 bg-denr-green-200 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-denr-green-200 rounded w-full mb-1"></div>
        <div className="h-3 bg-denr-green-200 rounded w-5/6"></div>
      </div>
    );
  }

  if (!text) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 border border-denr-green-200 bg-denr-green-50 rounded-lg"
    >
      <div className="flex items-center gap-2 mb-2 text-denr-green-800 font-semibold text-sm">
        <FileText size={16} />
        <span>Extracted Information</span>
        <CheckCircle size={14} className="text-denr-green-600 ml-auto" />
      </div>
      <div className="text-xs text-gray-700 font-mono whitespace-pre-wrap leading-relaxed">
        {text}
      </div>
    </motion.div>
  );
};
