import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Helper to safely restore user profile from localStorage
const getStoredUser = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('medvault_user') : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const storedUser = getStoredUser();
const storedToken = typeof window !== 'undefined' ? localStorage.getItem('medvault_token') : null;

// Initial Application State
const initialState = {
  isAuthenticated: !!(storedToken && storedUser),
  token: storedToken || null,
  user: storedUser || {
    id: 'USR-PATIENT-001',
    name: 'Alex Johnson',
    email: 'alex.johnson@gmail.com',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bloodType: 'O+',
    allergies: ['Penicillin', 'Latex'],
    emergencyContact: 'Emma Johnson (+1 555-0192)'
  },
  records: [
    {
      id: 'REC-2026-001',
      title: 'Comprehensive Cardiovascular Assessment',
      category: 'EHR',
      doctor: 'Dr. Sarah Mitchell, MD',
      date: '2026-10-14',
      status: 'Verified',
      confidentiality: 'Restricted',
      notes: 'Normal sinus rhythm, BP 120/78 mmHg, cardiac output optimal. Annual review advised.',
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
      notes: 'Fasting glucose 92 mg/dL, eGFR > 90, AST/ALT within standard baseline limits.',
      tags: ['Biochemistry', 'Metabolic', 'Blood']
    },
    {
      id: 'REC-2026-003',
      title: 'Lipid Profile & Apolipoprotein B Analysis',
      category: 'Lab',
      doctor: 'Pathology Diagnostics Labs',
      date: '2026-10-08',
      status: 'Borderline',
      confidentiality: 'Standard',
      notes: 'LDL 112 mg/dL, HDL 54 mg/dL, ApoB 85 mg/dL. Statin therapy actively titrated.',
      tags: ['Lipids', 'Preventive']
    },
    {
      id: 'REC-2026-004',
      title: 'Brain & Spine MRI Contrast Scan Report',
      category: 'Radiology',
      doctor: 'Metropolitan Imaging Center',
      date: '2026-09-12',
      status: 'Verified',
      confidentiality: 'Restricted',
      notes: 'No acute intracranial hemorrhage or focal mass effect observed in T1/T2 weighted sequences.',
      tags: ['MRI', 'Neurology', 'Imaging']
    }
  ],
  prescriptions: [
    {
      id: 'RX-901',
      medication: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily at bedtime',
      prescriber: 'Dr. Sarah Mitchell, MD',
      startDate: '2026-10-01',
      refillsLeft: 3,
      status: 'Active',
      pharmacy: 'Walgreens Pharmacy #401'
    },
    {
      id: 'RX-902',
      medication: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily in morning',
      prescriber: 'Dr. Sarah Mitchell, MD',
      startDate: '2026-09-15',
      refillsLeft: 2,
      status: 'Active',
      pharmacy: 'CVS Caremark #891'
    }
  ],
  appointments: [
    {
      id: 'APT-1001',
      doctor: 'Dr. Sarah Mitchell (Cardiology)',
      patient: 'Alex Johnson',
      patientId: 'USR-PATIENT-001',
      date: '2026-11-02',
      time: '10:30 AM',
      type: 'Cardiology Follow-up',
      status: 'Confirmed',
      room: 'Virtual Clinic Room 4'
    },
    {
      id: 'APT-1002',
      doctor: 'Dr. Robert Vance (Endocrinology)',
      patient: 'Alex Johnson',
      patientId: 'USR-PATIENT-001',
      date: '2026-11-15',
      time: '02:00 PM',
      type: 'Routine Metabolic Review',
      status: 'Pending',
      room: 'Suite 302, West Wing'
    }
  ],
  notifications: [
    { id: 1, message: 'Lab results for CMP-14 verified and securely decrypted.', time: '10 mins ago', unread: true, type: 'info' },
    { id: 2, message: 'Upcoming Cardiology consultation with Dr. Mitchell scheduled for Nov 02.', time: '2 hours ago', unread: true, type: 'appointment' },
    { id: 3, message: 'Refill request for Atorvastatin 20mg approved by pharmacy.', time: '1 day ago', unread: false, type: 'prescription' }
  ],
  announcements: [
    { id: 'ANN-1', title: 'HIPAA Security Protocol Upgrade v4.2', content: 'All patient medical files are now sealed with client-side SHA-256 envelope verification.', date: '2026-10-20', priority: 'High' },
    { id: 'ANN-2', title: 'Telehealth Virtual Suite Maintenance', content: 'Scheduled WebSocket cluster maintenance on Saturday from 02:00 to 03:00 UTC.', date: '2026-10-18', priority: 'Normal' }
  ],
  vitals: {
    heartRate: 72,
    bloodPressure: '118/76',
    oxygenLevel: 99,
    glucose: 94,
    timestamp: new Date().toLocaleTimeString()
  },
  systemTelemetry: {
    activeNodes: 8,
    clusterHealth: '100% Operational',
    encryptionAlgorithm: 'AES-256 GCM',
    activeSessions: 1420
  }
};

// State Reducer
function medVaultReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      if (action.payload.token) {
        localStorage.setItem('medvault_token', action.payload.token);
      }
      if (action.payload.user) {
        localStorage.setItem('medvault_user', JSON.stringify(action.payload.user));
      }
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token || state.token,
        user: {
          ...action.payload.user
        },
        notifications: [
          {
            id: Date.now(),
            message: `Welcome back, ${action.payload.user.name}. Authenticated via encrypted JWT session.`,
            time: 'Just now',
            unread: true,
            type: 'info'
          },
          ...state.notifications
        ]
      };

    case 'LOGOUT':
      localStorage.removeItem('medvault_token');
      localStorage.removeItem('medvault_user');
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        user: {
          id: '',
          name: 'Guest User',
          email: '',
          role: 'GUEST'
        }
      };

    case 'SET_USER_ROLE':
      // If user is already authenticated with this role, maintain full user profile
      if (state.user && state.user.role === action.payload && state.isAuthenticated) {
        return state;
      }
      // Never overwrite existing user name/email with a hardcoded doctor or patient persona
      return {
        ...state,
        user: {
          ...state.user,
          role: action.payload
        }
      };

    case 'ADD_RECORD':
      return {
        ...state,
        records: [action.payload, ...state.records],
        notifications: [
          {
            id: Date.now(),
            message: `New record "${action.payload.title}" encrypted and added to vault.`,
            time: 'Just now',
            unread: true,
            type: 'record'
          },
          ...state.notifications
        ]
      };

    case 'DELETE_RECORD':
      return {
        ...state,
        records: state.records.filter(r => r.id !== action.payload)
      };

    case 'ADD_APPOINTMENT':
      return {
        ...state,
        appointments: [action.payload, ...state.appointments],
        notifications: [
          {
            id: Date.now(),
            message: `Appointment reserved with ${action.payload.doctor} for ${action.payload.date}.`,
            time: 'Just now',
            unread: true,
            type: 'appointment'
          },
          ...state.notifications
        ]
      };

    case 'UPDATE_APPOINTMENT_STATUS':
      return {
        ...state,
        appointments: state.appointments.map(apt =>
          apt.id === action.payload.id ? { ...apt, status: action.payload.status } : apt
        )
      };

    case 'CANCEL_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(apt =>
          apt.id === action.payload ? { ...apt, status: 'Cancelled' } : apt
        ),
        notifications: [
          {
            id: Date.now(),
            message: `Appointment ${action.payload} marked as Cancelled.`,
            time: 'Just now',
            unread: true,
            type: 'alert'
          },
          ...state.notifications
        ]
      };

    case 'ADD_PRESCRIPTION':
      return {
        ...state,
        prescriptions: [action.payload, ...state.prescriptions]
      };

    case 'REQUEST_REFILL':
      return {
        ...state,
        prescriptions: state.prescriptions.map(p =>
          p.id === action.payload
            ? { ...p, refillsLeft: Math.max(0, p.refillsLeft - 1), status: 'Refill In-Transit' }
            : p
        ),
        notifications: [
          {
            id: Date.now(),
            message: `Refill order submitted to pharmacy for Rx ID: ${action.payload}.`,
            time: 'Just now',
            unread: true,
            type: 'prescription'
          },
          ...state.notifications
        ]
      };

    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, unread: false }))
      };

    case 'UPDATE_VITALS':
      return {
        ...state,
        vitals: action.payload
      };

    case 'ADD_ANNOUNCEMENT':
      return {
        ...state,
        announcements: [action.payload, ...state.announcements],
        notifications: [
          {
            id: Date.now(),
            message: `Admin Broadcast: ${action.payload.title}`,
            time: 'Just now',
            unread: true,
            type: 'announcement'
          },
          ...state.notifications
        ]
      };

    default:
      return state;
  }
}

// Context Creation
const MedVaultContext = createContext();

export function MedVaultProvider({ children }) {
  const [state, dispatch] = useReducer(medVaultReducer, initialState);

  // Live telemetry pulse
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch({
        type: 'UPDATE_VITALS',
        payload: {
          heartRate: Math.floor(68 + Math.random() * 10),
          bloodPressure: `${Math.floor(116 + Math.random() * 6)}/${Math.floor(74 + Math.random() * 5)}`,
          oxygenLevel: Math.floor(98 + Math.random() * 2),
          glucose: Math.floor(90 + Math.random() * 8),
          timestamp: new Date().toLocaleTimeString()
        }
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <MedVaultContext.Provider value={{ state, dispatch }}>
      {children}
    </MedVaultContext.Provider>
  );
}

// Custom Hook to consume state easily anywhere
export function useMedVaultState() {
  const context = useContext(MedVaultContext);
  if (!context) {
    throw new Error('useMedVaultState must be used within a MedVaultProvider');
  }
  return context;
}
