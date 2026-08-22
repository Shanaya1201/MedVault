import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { successResponse } from '../utils/apiResponse.js';
import { store } from '../data/store.js';
import Appointment from '../models/Appointment.js';

/**
 * Get all appointments
 * GET /api/appointments
 */
export const getAppointments = async (req, res, next) => {
  try {
    const { id, role } = req.user;

    let appointments = store.appointments.filter(apt => {
      if (role === 'PATIENT') return apt.patientId === id;
      if (role === 'DOCTOR') return apt.doctorId === id || apt.doctor.includes(req.user.name);
      return true; // ADMIN sees all
    });

    successResponse(res, 200, 'Appointments retrieved successfully', { appointments });
  } catch (err) {
    next(err);
  }
};

/**
 * Schedule a new Appointment
 * POST /api/appointments
 */
export const createAppointment = async (req, res, next) => {
  try {
    const { doctor, date, time, type = 'General Consultation', notes = '' } = req.body;
    const { id, name } = req.user;

    const newAppointment = {
      id: `APT-${1000 + store.appointments.length + 1}`,
      patientId: id,
      patientName: name,
      doctor: doctor || 'Dr. Sarah Mitchell, MD',
      doctorId: 'USR-DOCTOR-001',
      date,
      time,
      type,
      status: 'Confirmed',
      room: 'Virtual Telehealth Suite 4',
      notes
    };

    store.appointments.push(newAppointment);

    if (mongoose.connection.readyState === 1) {
      try {
        await Appointment.create(newAppointment);
      } catch {}
    }

    successResponse(res, 201, 'Consultation appointment scheduled and confirmed', {
      appointment: newAppointment
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update appointment status
 * PATCH /api/appointments/:id/status
 */
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = store.appointments.find(a => a.id === id);
    if (!appointment) {
      throw new ApiError(404, `Appointment '${id}' not found.`);
    }

    appointment.status = status;

    if (mongoose.connection.readyState === 1) {
      try {
        await Appointment.updateOne({ id }, { status });
      } catch {}
    }

    successResponse(res, 200, `Appointment status updated to ${status}`, { appointment });
  } catch (err) {
    next(err);
  }
};

/**
 * Cancel appointment
 * DELETE /api/appointments/:id
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = store.appointments.find(a => a.id === id);

    if (!appointment) {
      throw new ApiError(404, `Appointment '${id}' not found.`);
    }

    appointment.status = 'Cancelled';

    successResponse(res, 200, `Appointment '${id}' has been cancelled.`);
  } catch (err) {
    next(err);
  }
};
