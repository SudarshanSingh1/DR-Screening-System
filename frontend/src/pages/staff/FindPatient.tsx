import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { staffPatientApi } from '../../services/api/staffPatientApi';
import type { PatientSummaryForStaff } from '../../types/staff';
import { Search, Loader2 } from 'lucide-react';

export const FindPatient: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PatientSummaryForStaff[] | null>(null);
  const [error, setError] = useState('');
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);

  const executeSearch = useCallback(async (searchQuery: string) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Empty query is now allowed to fetch recent patients

    setLoading(true);
    setError('');
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await staffPatientApi.searchPatients(searchQuery, {
        signal: controller.signal
      });
      setResults(res);
    } catch (err: any) {
      if (err.name === 'AbortError') return; // Ignore aborted requests
      setError(err.message || 'Failed to search patients');
      // Do not clear old results on error
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  // Debounced live search
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (!(query || "").trim()) {
      executeSearch("");

      // Clear immediately if empty
      executeSearch('');
      return;
    }

    timerRef.current = window.setTimeout(() => {
      executeSearch(query || "");
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, executeSearch]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setQuery(q);
  }, [searchParams]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current);
    executeSearch(query || "");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Find Patient</h1>
      <form onSubmit={handleManualSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Patient ID, Name, Phone or Aadhaar reference..." 
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading && !results} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center min-w-[120px]">
          {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
          Search
        </button>
      </form>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>}

      {results && results.length === 0 && !loading && (
        <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          No patient found. Please check your query or register a new patient.
        </div>
      )}

      {results && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((p) => (
            <div key={p.id} className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{p.firstName} {p.lastName}</h3>
                <p className="text-sm text-gray-500 mt-1">ID: {p.id}</p>
                <div className="mt-3 flex gap-4 text-sm text-gray-600">
                   <span>Age: {p.age || '-'}</span>
                   <span>Gender: {p.gender || '-'}</span>
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => navigate(`/staff/patients/${p.id}`)} className="flex-1 bg-gray-50 border border-gray-200 py-2 rounded-lg text-sm font-medium hover:bg-gray-100">View Profile</button>
                <button onClick={() => navigate('/staff/screenings/new', { state: { patient: p } })} className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-100">Start Screening</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
