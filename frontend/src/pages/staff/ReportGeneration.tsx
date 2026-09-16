import React, { useState } from 'react';
import { staffReferralApi } from '../../services/api/staffReferralApi';
import { FileText, Loader2, Download, Search } from 'lucide-react';

export const ReportGeneration: React.FC = () => {
  const [screeningId, setScreeningId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screeningId.trim()) return;
    setLoading(true);
    setError('');
    setReportUrl(null);
    try {
      const res = await staffReferralApi.generateReport(screeningId);
      setReportUrl(res.url);
    } catch (err: any) {
      setError(err.message || 'Report generation failed or backend not available.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Generate Report</h1>
      
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <form onSubmit={handleGenerate} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Enter Screening ID to generate report..." 
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={screeningId}
              onChange={(e) => setScreeningId(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Generate'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start">
           <FileText className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
           <div>
             <h3 className="font-bold">Generation Failed</h3>
             <p className="text-sm mt-1">{error}</p>
           </div>
        </div>
      )}

      {reportUrl && (
        <div className="p-8 bg-green-50 text-green-800 rounded-xl border border-green-200 text-center">
           <FileText className="mx-auto h-12 w-12 text-green-500 mb-4" />
           <h3 className="font-bold text-xl mb-2">Report Generated Successfully</h3>
           <p className="text-sm mb-6">The screening report has been digitally signed by your staff profile.</p>
           <a href={reportUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition">
             <Download className="h-5 w-5 mr-2" /> Download PDF
           </a>
        </div>
      )}
    </div>
  );
};
