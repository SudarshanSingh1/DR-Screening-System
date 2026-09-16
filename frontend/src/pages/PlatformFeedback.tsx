import React, { useState, useEffect } from 'react';
import { platformFeedbackApi, type PlatformFeedbackSubmission } from '../services/api/platformFeedbackApi';
import { Send, AlertCircle, Loader2, Check } from 'lucide-react';

export const PlatformFeedback: React.FC = () => {
  const [category, setCategory] = useState('BUG_REPORT');
  const [text, setText] = useState('');
  const [caseId, setCaseId] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await platformFeedbackApi.getMyFeedback();
      setHistory(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Text feedback is required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const payload: PlatformFeedbackSubmission = { category, text };
      if (caseId.trim()) payload.caseReferenceId = caseId.trim();
      
      await platformFeedbackApi.submitFeedback(payload);
      setSuccess(true);
      setText('');
      setCaseId('');
      setCategory('BUG_REPORT');
      await loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while submitting feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Feedback</h1>
        <p className="text-gray-500 mt-1">Submit feedback regarding the Vision AI Platform (bugs, UX, workflow). Do NOT include patient identifiable information.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="feedbackCategory" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                id="feedbackCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="BUG_REPORT">Bug Report</option>
                <option value="UI_UX">UI / UX Issue</option>
                <option value="PERFORMANCE">Performance Issue</option>
                <option value="WORKFLOW">Workflow Problem</option>
                <option value="AI_RESULT">AI Result Usability</option>
                <option value="IMAGE_UPLOAD">Image Upload Issue</option>
                <option value="FEATURE_REQUEST">Feature Request</option>
                <option value="GENERAL_SUGGESTION">General Suggestion</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="caseId" className="block text-sm font-medium text-gray-700 mb-2">Optional Case Reference ID</label>
              <input
                id="caseId"
                type="text"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                placeholder="E.g., REF-9284"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="feedbackText" className="block text-sm font-medium text-gray-700 mb-2">Details (Required)</label>
            <textarea
              id="feedbackText"
              rows={6}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the issue or suggestion..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-sm text-green-800">Your feedback has been submitted successfully.</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
             <button
               type="submit"
               disabled={submitting || !text.trim()}
               className="flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
             >
               {submitting ? (
                 <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Submitting</>
               ) : (
                 <><Send className="-ml-1 mr-2 h-5 w-5" /> Submit Feedback</>
               )}
             </button>
          </div>
        </form>
      </div>

      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">My Feedback History</h2>
          <div className="space-y-4">
            {history.map(item => (
              <div key={item.id} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-700 rounded-md uppercase">{item.category}</span>
                  <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">{item.status}</span>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{item.text}</p>
                {item.caseReferenceId && (
                  <p className="text-xs text-gray-500 mt-2">Ref: {item.caseReferenceId}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
