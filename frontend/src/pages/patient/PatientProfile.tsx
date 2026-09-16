import React, { useState, useEffect, useRef } from 'react';
import { usePatient } from '../../hooks/usePatient';
import { patientApi } from '../../services/api/patientApi';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { Phone, Mail, Globe, Hash, User as UserIcon, Calendar, Check, X, Loader2, Edit2, Plus, AlertCircle, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { OtpInput } from '../../components/patient/OtpInput';

// Helper to generate deterministic color based on ID
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
};

// Deterministic avatar generator
const Avatar = ({ id, gender, size = 96 }: { id: string, gender?: string, size?: number }) => {
  const bgColor = stringToColor(id + 'bg');
  const isFemale = gender === 'Female';
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill={bgColor} opacity="0.2" />
      <circle cx="50" cy="50" r="46" fill="white" />
      {isFemale ? (
        <>
          <path d="M 30 75 Q 50 20 70 75 Z" fill={stringToColor(id)} opacity="0.8" />
          <circle cx="50" cy="45" r="18" fill="#FAD0C4" />
        </>
      ) : (
        <>
          <path d="M 25 85 Q 50 40 75 85 Z" fill={stringToColor(id)} opacity="0.8" />
          <circle cx="50" cy="40" r="18" fill="#FAD0C4" />
        </>
      )}
    </svg>
  );
};

export const PatientProfile: React.FC = () => {
  const { patient, loading, error, updateProfile } = usePatient();
  const { t, language, setLanguage } = useLanguage();
  
  // Verification Flow State
  type FlowState = 'idle' | 'enter_email' | 'verify_code';
  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [emailInput, setEmailInput] = useState('');
  const [flowError, setFlowError] = useState('');
  const [flowSuccess, setFlowSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Verification Specific State
  const [verificationReqId, setVerificationReqId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const timerRef = useRef<number | null>(null);

  // Sync preferred language from profile if available
  useEffect(() => {
    if (patient?.preferredLanguage && patient.preferredLanguage !== language) {
       setLanguage(patient.preferredLanguage as 'en' | 'hi');
    }
  }, [patient?.preferredLanguage]);

  // Handle Resend Countdown
  useEffect(() => {
    if (resendCountdown > 0) {
      timerRef.current = window.setTimeout(() => setResendCountdown(c => c - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resendCountdown]);

  if (loading) {
    return <LoadingState message={t('loading_profile')} />;
  }

  if (error || !patient) {
    return <ErrorState message={t('error_load_profile')} />;
  }

  const maskAadhaar = (aadhaar?: string) => {
    if (!aadhaar || aadhaar.length < 12) return t('not_provided');
    return `XXXX XXXX ${aadhaar.slice(-4)}`;
  };
  
  const maskEmail = (emailStr: string) => {
    if (!emailStr) return '';
    const [name, domain] = emailStr.split('@');
    if (!domain) return emailStr;
    const maskedName = name.length > 2 ? name[0] + '*'.repeat(name.length - 2) + name[name.length - 1] : name;
    return `${maskedName}@${domain}`;
  };

  const handleStartEmailEdit = () => {
    setEmailInput(patient.email || '');
    setFlowError('');
    setFlowSuccess('');
    setFlowState('enter_email');
  };

  const handleCancelFlow = () => {
    setFlowState('idle');
    setEmailInput('');
    setOtpCode('');
    setFlowError('');
    setVerificationReqId('');
  };

  const handleRequestVerification = async () => {
    if (!emailInput.trim()) {
      setFlowError(t('email_required'));
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      setFlowError(t('email_invalid'));
      return;
    }

    setIsLoading(true);
    setFlowError('');
    try {
      const res = await patientApi.requestEmailVerification(emailInput.trim());
      setVerificationReqId(res.requestId);
      setResendCountdown(30); // 30 sec cooldown
      setOtpCode('');
      setFlowState('verify_code');
    } catch (err) {
      setFlowError(t('could_not_load'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (otpCode.length < 6) return;
    
    setIsLoading(true);
    setFlowError('');
    try {
      await patientApi.verifyEmailCode(verificationReqId, otpCode);
      // Code verified successfully, update profile
      await updateProfile({ email: emailInput.trim(), emailVerified: true });
      
      setFlowSuccess(t('email_verified_successfully'));
      setFlowState('idle');
      setOtpCode('');
      setVerificationReqId('');
    } catch (err) {
      if (err instanceof Error) {
        setFlowError(t(err.message as any) || err.message); // Will map 'invalid_code' to translation
      } else {
        setFlowError(t('could_not_load'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setFlowError('');
    try {
      await patientApi.resendEmailVerification(verificationReqId);
      setResendCountdown(30);
      setFlowError('');
    } catch (err) {
      setFlowError(t('could_not_load'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (newLang: 'en' | 'hi') => {
    setLanguage(newLang);
    try {
      await updateProfile({ preferredLanguage: newLang });
    } catch (err) {
      console.error('Failed to save language preference', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('my_profile')}</h1>

      {flowSuccess && flowState === 'idle' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center shadow-sm">
          <Check className="h-5 w-5 text-green-500 mr-3" />
          <p className="text-sm font-medium text-green-800">{flowSuccess}</p>
          <button onClick={() => setFlowSuccess('')} className="ml-auto text-green-600 hover:text-green-800"><X className="h-4 w-4"/></button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
         <div className="p-6 sm:p-8">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-8 border-b border-gray-200">
               <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-50 flex items-center justify-center">
                 {patient.id ? (
                   <Avatar id={patient.id} gender={patient.gender} />
                 ) : (
                   <UserIcon className="h-12 w-12 text-gray-400" />
                 )}
               </div>
               <div className="text-center sm:text-left mt-2 sm:mt-0 flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                     {patient.fullName || t('not_provided')}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{t('patient_id')}: {patient.id || '---'}</p>
               </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('personal_information')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Left Column */}
               <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center mb-1">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" /> {t('mobile_number')}
                    </h4>
                    <p className="text-gray-700 pl-6">{patient.mobileNumber || t('not_provided')}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center mb-1">
                      <Hash className="h-4 w-4 mr-2 text-gray-400" /> {t('aadhaar_number')}
                    </h4>
                    <p className="text-gray-700 pl-6 tracking-widest">{maskAadhaar(patient.aadhaarNumber)}</p>
                  </div>

                  {/* Email Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" /> {t('email_address')}
                      </h4>
                      {flowState === 'idle' && (
                        <button 
                          onClick={handleStartEmailEdit}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                        >
                          {patient.email ? <><Edit2 className="h-3 w-3 mr-1"/> {t('edit')}</> : <><Plus className="h-3 w-3 mr-1"/> {t('add_email')}</>}
                        </button>
                      )}
                    </div>
                    
                    {flowState === 'idle' && (
                      <div className="pl-6 flex items-center gap-2">
                        <p className="text-gray-700">
                          {patient.email || <span className="text-gray-400 italic">{t('not_provided')}</span>}
                        </p>
                        {patient.email && patient.emailVerified && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            {t('verified')} ✓
                          </span>
                        )}
                      </div>
                    )}

                    {flowState === 'enter_email' && (
                      <div className="pl-6 mt-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {patient.email && (
                          <p className="text-xs text-orange-700 mb-3 bg-orange-50 p-2 rounded border border-orange-100 flex items-start">
                            <ShieldAlert className="h-4 w-4 mr-1.5 shrink-0" />
                            {t('change_email_requires_verification')}
                          </p>
                        )}
                        <input 
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className={`w-full border ${flowError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm py-2 px-3 text-sm`}
                          placeholder="patient@example.com"
                          disabled={isLoading}
                        />
                        {flowError && <p className="text-red-500 text-xs mt-1.5">{flowError}</p>}
                        
                        <div className="flex gap-3 mt-4">
                          <button 
                            onClick={handleRequestVerification}
                            disabled={isLoading || !emailInput.trim()}
                            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center flex-1 justify-center"
                          >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2"/>}
                            {t('continue')}
                          </button>
                          <button 
                            onClick={handleCancelFlow}
                            disabled={isLoading}
                            className="bg-white border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors flex-1"
                          >
                            {t('cancel')}
                          </button>
                        </div>
                      </div>
                    )}

                    {flowState === 'verify_code' && (
                      <div className="pl-0 sm:pl-6 mt-2">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                          
                          <div className="mt-4 text-center mb-6">
                            <h4 className="text-lg font-bold text-gray-900 mb-2">{t('verify_your_email')}</h4>
                            <p className="text-sm text-gray-500">
                              {t('we_sent_code_to')}<br/>
                              <span className="font-medium text-gray-900">{maskEmail(emailInput)}</span>
                            </p>
                          </div>
                          
                          <OtpInput 
                            length={6} 
                            value={otpCode} 
                            onChange={setOtpCode}
                            disabled={isLoading}
                          />

                          {flowError && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded text-sm text-red-700 flex items-start">
                              <AlertCircle className="h-4 w-4 mr-2 shrink-0 mt-0.5" />
                              <p>{flowError}</p>
                            </div>
                          )}

                          <div className="mt-6 flex flex-col gap-3">
                            <button 
                              onClick={handleVerifyCode}
                              disabled={isLoading || otpCode.length < 6}
                              className="w-full bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                            >
                              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2"/>}
                              {t('verify_email')}
                            </button>
                            
                            <div className="flex justify-between items-center mt-2">
                              <button 
                                onClick={handleCancelFlow}
                                disabled={isLoading}
                                className="text-sm font-medium text-gray-500 hover:text-gray-700"
                              >
                                {t('cancel')}
                              </button>
                              
                              <button
                                onClick={handleResendCode}
                                disabled={resendCountdown > 0 || isLoading}
                                className={`text-sm font-medium ${resendCountdown > 0 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'}`}
                              >
                                {resendCountdown > 0 
                                  ? `${t('resend_in_seconds')} ${resendCountdown}s` 
                                  : t('resend_code')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
               </div>
               
               {/* Right Column */}
               <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center mb-1">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" /> {t('age')}
                    </h4>
                    <p className="text-gray-700 pl-6">{patient.age ? `${patient.age} ${t('years')}` : t('not_provided')}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center mb-1">
                      <UserIcon className="h-4 w-4 mr-2 text-gray-400" /> {t('gender')}
                    </h4>
                    <p className="text-gray-700 pl-6">{patient.gender || t('not_provided')}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center mb-1">
                      <Globe className="h-4 w-4 mr-2 text-gray-400" /> {t('preferred_language')}
                    </h4>
                    <div className="pl-6 mt-1">
                      <select 
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'hi')}
                        className="block w-full max-w-[200px] border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 border bg-white cursor-pointer"
                      >
                        <option value="en">English</option>
                        <option value="hi">हिन्दी (Hindi)</option>
                      </select>
                    </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
