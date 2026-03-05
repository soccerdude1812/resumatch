'use client';

import { useState, useCallback } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface ExportButtonProps {
  resumeText: string;
  disabled?: boolean;
  className?: string;
}

export default function ExportButton({
  resumeText,
  disabled = false,
  className = '',
}: ExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = useCallback(async () => {
    if (isGenerating || disabled || !resumeText.trim()) return;

    setIsGenerating(true);

    try {
      // Dynamic imports for code splitting — @react-pdf/renderer is large
      const [{ pdf }, { default: ResumePDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/pdf/ResumePDF'),
      ]);

      // Generate the PDF blob
      const blob = await pdf(<ResumePDF resumeText={resumeText} />).toBlob();

      // Create a download link and trigger it
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tailored-resume-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [resumeText, isGenerating, disabled]);

  return (
    <button
      onClick={handleExport}
      disabled={disabled || isGenerating || !resumeText.trim()}
      className={`
        inline-flex items-center gap-2 px-4 py-2
        bg-blue-600 text-white font-medium text-sm
        rounded-lg shadow-sm
        hover:bg-blue-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-150
        ${className}
      `}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>Download PDF</span>
        </>
      )}
    </button>
  );
}
