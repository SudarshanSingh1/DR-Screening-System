import { useState, useEffect, useCallback } from 'react';
import { patientApi } from '../services/api/patientApi';
import type { PatientProfile, Screening, Notification } from '../types/patient';

export const usePatient = () => {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPatient = useCallback(async () => {
    setLoading(true);
    try {
      const data = await patientApi.getCurrentPatient();
      setPatient(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load patient'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  const updateProfile = async (updates: Partial<PatientProfile>) => {
    try {
      const updated = await patientApi.updatePatientProfile(updates);
      setPatient(updated);
      return updated;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update profile');
    }
  };

  return { patient, loading, error, refresh: fetchPatient, updateProfile };
};

export const useScreenings = () => {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchScreenings = async () => {
      try {
        const data = await patientApi.getPatientScreenings();
        setScreenings(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load screenings'));
      } finally {
        setLoading(false);
      }
    };
    fetchScreenings();
  }, []);

  return { screenings, loading, error };
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await patientApi.getPatientNotifications();
        setNotifications(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load notifications'));
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return { notifications, loading, error };
};
