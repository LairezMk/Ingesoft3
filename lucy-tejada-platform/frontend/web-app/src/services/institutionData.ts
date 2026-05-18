/**
 * ============================================
 * INSTITUTION DATA - NO SEED DATA
 * ============================================
 */

export const institutionDataset = {
  students: [],
  teachers: [],
  programs: [],
  groups: [],
  enrollments: [],
  venues: [],
  reservations: [],
  maintenance_records: [],
  contracts: [],
  attendance_records: [],
  evaluations: [],
};

export const ensureInstitutionData = () => {
  // No-op: data must come from Firestore.
};

export const getInstitutionDatasetVersion = () => "";
