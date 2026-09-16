import React, { useState, useRef } from 'react';
import { patientApi } from '../../services/api/patientApi';
import { Mic, Image as ImageIcon, X, Send, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const PatientFeedback: React.FC = () => {
  const [category, setCategory] = useState('SCREENING_EXPERIENCE');
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { t } = useLanguage();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setImageFile(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (_err) {
      setError("Microphone permission denied or not supported by your browser.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const removeAudio = () => {
    setAudioBlob(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imageFile && !audioBlob) {
      setError(t('error_no_feedback'));
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await patientApi.submitPatientFeedback({ category, text, imageFile: imageFile || undefined, audioBlob: audioBlob || undefined });
      setSuccess(true);
      setText('');
      setImageFile(null);
      setAudioBlob(null);
      setCategory('SCREENING_EXPERIENCE');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while submitting feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('share_experience')}</h1>
        <p className="text-gray-500 mt-1">{t('feedback_desc')}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label htmlFor="feedbackCategory" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="feedbackCategory"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="SCREENING_EXPERIENCE">Screening Experience</option>
              <option value="STAFF_BEHAVIOR">Staff Behavior</option>
              <option value="HOSPITAL_EXPERIENCE">Hospital Experience</option>
              <option value="PLATFORM_EXPERIENCE">Platform Experience</option>
              <option value="SUGGESTION">Suggestion</option>
              <option value="COMPLAINT">Complaint</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="feedbackText" className="block text-sm font-medium text-gray-700 mb-2">
              {t('tell_us_experience')}
            </label>
            <textarea
              id="feedbackText"
              rows={5}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('type_feedback_here')}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
             <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-gray-50">
               <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                 <Mic className="h-4 w-4 mr-2" /> {t('voice_feedback')}
               </h3>
               {!audioBlob ? (
                 <button
                   type="button"
                   onClick={isRecording ? stopRecording : startRecording}
                   className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                     isRecording 
                       ? 'bg-red-100 text-red-700 hover:bg-red-200 animate-pulse' 
                       : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                   }`}
                 >
                   {isRecording ? t('stop_recording') : t('start_recording')}
                 </button>
               ) : (
                 <div className="flex items-center justify-between bg-white border border-gray-300 rounded-md p-2">
                    <span className="text-sm text-gray-600 truncate">{t('audio_recorded')}</span>
                    <button type="button" onClick={removeAudio} className="text-red-500 hover:text-red-700" aria-label="Remove audio">
                       <X className="h-4 w-4" />
                    </button>
                 </div>
               )}
             </div>

             <div className="flex-1 border border-gray-200 rounded-lg p-4 bg-gray-50">
               <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                 <ImageIcon className="h-4 w-4 mr-2" /> {t('attach_image')}
               </h3>
               {!imageFile ? (
                 <div>
                   <input
                     type="file"
                     id="imageUpload"
                     accept="image/*"
                     className="sr-only"
                     onChange={handleImageChange}
                   />
                   <label
                     htmlFor="imageUpload"
                     className="cursor-pointer block text-center w-full py-2 px-4 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                   >
                     {t('select_file')}
                   </label>
                 </div>
               ) : (
                 <div className="flex items-center justify-between bg-white border border-gray-300 rounded-md p-2">
                    <span className="text-sm text-gray-600 truncate">{imageFile.name}</span>
                    <button type="button" onClick={removeImage} className="text-red-500 hover:text-red-700" aria-label="Remove image">
                       <X className="h-4 w-4" />
                    </button>
                 </div>
               )}
             </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">{t('feedback_success')}</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
             <button
               type="submit"
               disabled={submitting}
               className="w-full sm:w-auto flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {submitting ? (
                 <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> {t('submitting')}</>
               ) : (
                 <><Send className="-ml-1 mr-2 h-5 w-5" /> {t('submit_feedback')}</>
               )}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};
