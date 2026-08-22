import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

/**
 * MedVault Core React Hooks Suite
 * Integrates useState, useEffect, useRef, useMemo, and useCallback
 * for real-world healthcare workflow operations.
 */
export function useMedVault() {
  // 1. useState: Clinical state & user context
  const [userRole, setUserRole] = useState('PATIENT');
  const [records, setRecords] = useState([
    {
      id: 'REC-2026-001',
      title: 'Comprehensive Cardiovascular Assessment',
      category: 'EHR',
      doctor: 'Dr. Sarah Mitchell, MD',
      date: '2026-10-14',
      status: 'Verified',
      confidentiality: 'Restricted',
      notes: 'Normal sinus rhythm, BP 120/78 mmHg, cholesterol management ongoing.',
      tags: ['Cardiology', 'Preventive', 'ECG']
    },
    {
      id: 'REC-2026-002',
      title: 'Comprehensive Metabolic Panel (CMP-14)',
      category: 'Lab',
      doctor: 'Pathology Diagnostics Labs',
      date: '2026-10-10',
      status: 'Normal',
      confidentiality: 'Standard',
      notes: 'Fasting glucose 92 mg/dL, eGFR > 90, AST/ALT within normal reference ranges.',
      tags: ['Biochemistry', 'Metabolic', 'Blood']
    },
    {
      id: 'REC-2026-003',
      title: 'Lipid Profile & Apolipoprotein B',
      category: 'Lab',
      doctor: 'Pathology Diagnostics Labs',
      date: '2026-10-08',
      status: 'Borderline',
      confidentiality: 'Standard',
      notes: 'LDL 112 mg/dL, HDL 54 mg/dL, ApoB 85 mg/dL. Statin therapy advised.',
      tags: ['Lipids', 'Preventive']
    },
    {
      id: 'REC-2026-004',
      title: 'Atorvastatin 20mg & Lisinopril 10mg',
      category: 'Prescription',
      doctor: 'Dr. Sarah Mitchell, MD',
      date: '2026-10-01',
      status: 'Active',
      confidentiality: 'Standard',
      notes: 'Take 1 tablet daily at bedtime. 3 refills remaining at Walgreens Pharmacy #401.',
      tags: ['Cardiology', 'Pharmacy', 'Rx']
    },
    {
      id: 'REC-2026-005',
      title: 'Brain & Spine MRI Contrast Report',
      category: 'Radiology',
      doctor: 'Metropolitan Imaging Center',
      date: '2026-09-12',
      status: 'Verified',
      confidentiality: 'Restricted',
      notes: 'No acute intracranial hemorrhage or focal mass effect noted.',
      tags: ['MRI', 'Neurology', 'Imaging']
    }
  ]);

  const [appointments, setAppointments] = useState([
    {
      id: 'APT-1001',
      doctor: 'Dr. Sarah Mitchell (Cardiology)',
      patient: 'Alex Johnson',
      date: '2026-11-02',
      time: '10:30 AM',
      type: 'Follow-up Consultation',
      status: 'Confirmed',
      room: 'Virtual Clinic Room 4'
    },
    {
      id: 'APT-1002',
      doctor: 'Dr. Robert Vance (Endocrinology)',
      patient: 'Alex Johnson',
      date: '2026-11-15',
      time: '02:00 PM',
      type: 'Routine Screening',
      status: 'Pending',
      room: 'Suite 302, West Wing'
    }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Lab results for Comprehensive Metabolic Panel verified and decrypted.', time: '10 mins ago', unread: true, type: 'info' },
    { id: 2, message: 'Upcoming Cardiology consultation scheduled for Nov 02.', time: '2 hours ago', unread: true, type: 'appointment' },
    { id: 3, message: 'Pharmacy confirmed prescription refill for Atorvastatin 20mg.', time: '1 day ago', unread: false, type: 'prescription' }
  ]);

  const [vitals, setVitals] = useState({
    heartRate: 72,
    bloodPressure: '118/76',
    oxygenLevel: 99,
    glucose: 94,
    timestamp: new Date().toLocaleTimeString()
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // 2. useRef: Track render count, interval timer ID, and input focus
  const renderCountRef = useRef(0);
  const telemetryIntervalRef = useRef(null);

  useEffect(() => {
    renderCountRef.current += 1;
  });

  // 3. useEffect: Telemetry simulation and live vital telemetry updates
  useEffect(() => {
    telemetryIntervalRef.current = setInterval(() => {
      setVitals({
        heartRate: Math.floor(68 + Math.random() * 10),
        bloodPressure: `${Math.floor(116 + Math.random() * 6)}/${Math.floor(74 + Math.random() * 5)}`,
        oxygenLevel: Math.floor(98 + Math.random() * 2),
        glucose: Math.floor(90 + Math.random() * 8),
        timestamp: new Date().toLocaleTimeString()
      });
    }, 4000);

    return () => {
      if (telemetryIntervalRef.current) {
        clearInterval(telemetryIntervalRef.current);
      }
    };
  }, []);

  // Document title sync via useEffect
  useEffect(() => {
    document.title = `MedVault | ${userRole} Portal`;
  }, [userRole]);

  // 4. useMemo: Highly optimized filtered records and statistical metrics
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [records, searchQuery, categoryFilter]);

  const recordStats = useMemo(() => {
    return {
      total: records.length,
      ehrCount: records.filter(r => r.category === 'EHR').length,
      labCount: records.filter(r => r.category === 'Lab').length,
      prescriptionCount: records.filter(r => r.category === 'Prescription').length,
      radiologyCount: records.filter(r => r.category === 'Radiology').length,
      verifiedCount: records.filter(r => r.status === 'Verified' || r.status === 'Normal').length
    };
  }, [records]);

  // 5. useCallback: Memoized handlers for performance and consistency
  const addRecord = useCallback((newRecord) => {
    const recordWithId = {
      ...newRecord,
      id: `REC-2026-${String(records.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Verified',
      confidentiality: 'Standard',
      tags: newRecord.tags || ['General']
    };
    setRecords(prev => [recordWithId, ...prev]);
    setNotifications(prev => [
      {
        id: Date.now(),
        message: `New medical record "${newRecord.title}" successfully encrypted and stored.`,
        time: 'Just now',
        unread: true,
        type: 'record'
      },
      ...prev
    ]);
  }, [records.length]);

  const bookAppointment = useCallback((aptData) => {
    const newApt = {
      id: `APT-${1000 + appointments.length + 1}`,
      doctor: aptData.doctor || 'Dr. Sarah Mitchell (Cardiology)',
      patient: 'Alex Johnson',
      date: aptData.date,
      time: aptData.time,
      type: aptData.type || 'Clinical Consultation',
      status: 'Confirmed',
      room: 'Virtual Telehealth Suite'
    };
    setAppointments(prev => [newApt, ...prev]);
    setNotifications(prev => [
      {
        id: Date.now(),
        message: `Appointment booked with ${newApt.doctor} for ${newApt.date} at ${newApt.time}.`,
        time: 'Just now',
        unread: true,
        type: 'appointment'
      },
      ...prev
    ]);
  }, [appointments.length]);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  }, []);

  return {
    userRole,
    setUserRole,
    records,
    filteredRecords,
    recordStats,
    appointments,
    notifications,
    vitals,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    addRecord,
    bookAppointment,
    markAllNotificationsRead,
    renderCount: renderCountRef.current
  };
}
