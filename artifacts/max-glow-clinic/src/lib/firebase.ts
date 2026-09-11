import { getApp, getApps, initializeApp } from 'firebase/app';
import { getDatabase, onValue, ref, set } from 'firebase/database';

type Appointment = { id: string; name: string; phone: string; date: string; message: string; treatment: string; createdAt: string };

const firebaseConfig = {
  apiKey: 'AIzaSyBH9PIngClsWXxetqVItnjENtoUQynO3l4',
  authDomain: 'max-glow-aesthetic.firebaseapp.com',
  databaseURL: 'https://max-glow-aesthetic-default-rtdb.firebaseio.com',
  projectId: 'max-glow-aesthetic',
  storageBucket: 'max-glow-aesthetic.firebasestorage.app',
  messagingSenderId: '444619100417',
  appId: '1:444619100417:web:4511d80d021c8832e7cb00',
  measurementId: 'G-PKNDS95QMY',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const database = getDatabase(app);

export function saveFirebaseAppointment(appointment: Appointment) {
  return set(ref(database, `appointments/${appointment.id}`), appointment);
}

export function subscribeToFirebaseAppointments(
  onAppointments: (appointments: Appointment[]) => void,
  onError?: () => void,
) {
  return onValue(ref(database, 'appointments'), (snapshot) => {
    const value = snapshot.val() as Record<string, Appointment> | null;
    const appointments = value ? Object.values(value).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [];
    onAppointments(appointments);
  }, onError);
}
