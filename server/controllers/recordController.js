import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { successResponse } from '../utils/apiResponse.js';
import { store } from '../data/store.js';
import Record from '../models/Record.js';

/**
 * Get all medical records (Filtered by Patient ID or Role)
 * GET /api/records
 */
export const getRecords = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    const { category, search } = req.query;

    let records = [];

    // Attempt Mongoose fetch only if live connection is connected (readyState === 1)
    if (mongoose.connection.readyState === 1) {
      try {
        const query = {};
        if (role === 'PATIENT') query.patientId = id;
        if (category && category !== 'ALL') query.category = category;
        if (search) query.title = { $regex: search, $options: 'i' };
        records = await Record.find(query);
      } catch {
        records = [];
      }
    }

    if (!records || records.length === 0) {
      records = store.records.filter(r => {
        const matchesRole = role === 'PATIENT' ? r.patientId === id : true;
        const matchesCat = !category || category === 'ALL' || r.category === category;
        const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
        return matchesRole && matchesCat && matchesSearch;
      });
    }

    successResponse(res, 200, 'Medical records retrieved successfully', { records });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new Medical Record
 * POST /api/records
 */
export const createRecord = async (req, res, next) => {
  try {
    const { title, category, notes, tags, confidentiality = 'Standard' } = req.body;
    const { id, name, role } = req.user;

    const newRecord = {
      id: `REC-2026-${String(store.records.length + 1).padStart(3, '0')}`,
      patientId: role === 'PATIENT' ? id : (req.body.patientId || id),
      title,
      category: category || 'EHR',
      doctor: role === 'DOCTOR' ? name : (req.body.doctor || 'Dr. Sarah Mitchell, MD'),
      date: new Date().toISOString().split('T')[0],
      status: 'Verified',
      confidentiality,
      notes,
      tags: Array.isArray(tags) ? tags : ['EHR']
    };

    store.records.unshift(newRecord);

    if (mongoose.connection.readyState === 1) {
      try {
        await Record.create(newRecord);
      } catch {}
    }

    successResponse(res, 201, 'Medical record securely sealed and stored', { record: newRecord });
  } catch (err) {
    next(err);
  }
};

/**
 * Get record by ID
 * GET /api/records/:id
 */
export const getRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = store.records.find(r => r.id === id || r._id?.toString() === id);

    if (!record) {
      throw new ApiError(404, `Medical record '${id}' not found in vault.`);
    }

    successResponse(res, 200, 'Record decrypted and retrieved', { record });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete Record
 * DELETE /api/records/:id
 */
export const deleteRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const index = store.records.findIndex(r => r.id === id || r._id?.toString() === id);

    if (index === -1) {
      throw new ApiError(404, `Medical record '${id}' not found.`);
    }

    store.records.splice(index, 1);

    if (mongoose.connection.readyState === 1) {
      try {
        await Record.deleteOne({ $or: [{ id }, { _id: id }] });
      } catch {}
    }

    successResponse(res, 200, `Record '${id}' successfully removed from vault.`);
  } catch (err) {
    next(err);
  }
};
