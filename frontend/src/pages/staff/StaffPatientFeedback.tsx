import React, { useEffect, useState } from 'react';
import { staffFeedbackApi } from '../../services/api/staffFeedbackApi';
import type { PatientFeedbackSummary } from '../../types/staff';
import { MessageSquare, Loader2, Mic, Image as ImageIcon } from 'lucide-react';

export const StaffPatientFeedback: React.FC = () => {
  const [feedback, setFeedback] = useState<PatientFeedbackSummary[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await staffFeedbackApi.getPatientFeedback();
        setFeedback(res);
      } catch {
        setFeedback([]);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Patient Feedback Queue</h1>
      
      {feedback && feedback.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>No patient feedback available for your facility.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedback?.map(f => (
            <div key={f.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">{f.category}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  f.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-800' :
                  f.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>{f.status}</span>
              </div>
              <p className="text-sm text-gray-700 mt-2 line-clamp-3">{f.textPreview || 'No text provided'}</p>
              
              <div className="flex items-center space-x-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span>{new Date(f.submittedAt).toLocaleDateString()}</span>
                <div className="flex space-x-2">
                  {f.hasVoice && <span title="Contains Voice"><Mic className="h-4 w-4 text-blue-500" /></span>}
                  {f.hasImage && <span title="Contains Image"><ImageIcon className="h-4 w-4 text-green-500" /></span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
