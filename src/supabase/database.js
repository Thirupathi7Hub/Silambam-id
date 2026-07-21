// Supabase Database — replaces src/firebase/firestore.js
// Uses Supabase PostgreSQL (members table) instead of Firestore
import { supabase } from './config';

export const TABLES = {
  USERS:             'members',
  DISTRICT_COUNTERS: 'district_counters',
  SETTINGS:          'settings',
};

// ── serverTimestamp helper (matches Firestore API) ──
export const serverTimestamp = () => new Date().toISOString();

// ── Membership ID Generation (atomic via RPC) ──
/**
 * Generate next membership ID for a district.
 * Format: ARL-001-TNSA-1, ARL-001-TNSA-2, ...
 * districtFullCode example: 'ARL-001-TNSA'
 */
export const generateMembershipId = async (districtFullCode) => {
  // Try RPC function first (set up in Supabase SQL editor)
  const { data, error } = await supabase.rpc('generate_membership_id', {
    p_district_code: districtFullCode,
  });

  if (error) {
    // Fallback: manual counter upsert
    console.warn('RPC failed, using manual counter:', error.message);
    return await _manualMembershipId(districtFullCode);
  }
  return data; // e.g. 'ARL-001-TNSA-1'
};

const _manualMembershipId = async (districtFullCode) => {
  const { data: existing } = await supabase
    .from(TABLES.DISTRICT_COUNTERS)
    .select('last_number')
    .eq('district_code', districtFullCode)
    .single();

  const nextNumber = (existing?.last_number ?? 0) + 1;

  await supabase.from(TABLES.DISTRICT_COUNTERS).upsert({
    district_code: districtFullCode,
    last_number:   nextNumber,
    updated_at:    serverTimestamp(),
  }, { onConflict: 'district_code' });

  // Format: ARL-001-TNSA-1
  return `${districtFullCode}-${nextNumber}`;
};

// ── User / Member Operations ──

/**
 * Create a new member row in the members table
 */
export const createUser = async (uid, userData) => {
  const { error } = await supabase.from(TABLES.USERS).insert({
    id:            uid,
    membership_id: userData.membershipId,
    name:          userData.name,
    father_name:   userData.fatherName,
    dob:           userData.dob,
    gender:        userData.gender,
    aadhaar:       userData.aadhaar,
    mobile:        userData.mobile,
    email:         userData.email,
    address:       userData.address,
    district:      userData.district,
    district_code: userData.districtCode,
    club_name:     userData.clubName,
    category:      userData.category,
    position:      userData.position,
    photo_url:     userData.photoURL,
    role:          'user',
    status:        userData.status || 'pending',
    created_at:    serverTimestamp(),
    updated_at:    serverTimestamp(),
  });

  if (error) throw error;
};

/**
 * Get user by UID — returns camelCase object matching old Firestore shape
 */
export const getUserById = async (uid) => {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .select('*')
    .eq('id', uid)
    .single();

  if (error || !data) return null;
  return _toUserShape(data);
};

/**
 * Update user document
 */
export const updateUser = async (uid, updates) => {
  const dbUpdates = {};
  if (updates.name)        dbUpdates.name        = updates.name;
  if (updates.fatherName)  dbUpdates.father_name = updates.fatherName;
  if (updates.dob)         dbUpdates.dob         = updates.dob;
  if (updates.gender)      dbUpdates.gender      = updates.gender;
  if (updates.mobile)      dbUpdates.mobile      = updates.mobile;
  if (updates.address)     dbUpdates.address     = updates.address;
  if (updates.district)    dbUpdates.district    = updates.district;
  if (updates.clubName)    dbUpdates.club_name   = updates.clubName;
  if (updates.category)    dbUpdates.category    = updates.category;
  if (updates.position)    dbUpdates.position    = updates.position;
  if (updates.photoURL)    dbUpdates.photo_url   = updates.photoURL;
  if (updates.status)      dbUpdates.status      = updates.status;
  if (updates.role)        dbUpdates.role        = updates.role;
  dbUpdates.updated_at = serverTimestamp();

  const { error } = await supabase
    .from(TABLES.USERS)
    .update(dbUpdates)
    .eq('id', uid);

  if (error) throw error;
};

/**
 * Soft-delete user (status = 'deleted')
 */
export const deleteUser = async (uid) => {
  const { error } = await supabase
    .from(TABLES.USERS)
    .update({ status: 'deleted', updated_at: serverTimestamp() })
    .eq('id', uid);
  if (error) throw error;
};

/**
 * Permanently delete user
 */
export const permanentlyDeleteUser = async (uid) => {
  const { error } = await supabase.from(TABLES.USERS).delete().eq('id', uid);
  if (error) throw error;
};

/**
 * Get user by membership ID
 */
export const getUserByMembershipId = async (membershipId) => {
  const { data } = await supabase
    .from(TABLES.USERS)
    .select('*')
    .eq('membership_id', membershipId)
    .neq('status', 'deleted')
    .single();
  return data ? _toUserShape(data) : null;
};

// ── Admin: Member Queries ──

export const getMembers = async (filters = {}, pageSize = 20, lastDoc = null) => {
  let query = supabase
    .from(TABLES.USERS)
    .select('*', { count: 'exact' })
    .neq('status', 'deleted')
    .neq('role', 'admin')       // exclude admins from member directory
    .order('created_at', { ascending: false });

  if (filters.district) query = query.eq('district', filters.district);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.gender)   query = query.eq('gender', filters.gender);
  if (filters.status)   query = query.eq('status', filters.status);

  // Pagination via range
  const from = lastDoc ? lastDoc : 0;
  query = query.range(from, from + pageSize - 1);

  const { data, error } = await query;
  if (error) throw error;

  const members = (data || []).map(_toUserShape);
  const hasMore = members.length === pageSize;
  const lastVisible = hasMore ? from + pageSize : null;

  return { members, lastVisible, hasMore };
};

export const getAllMembersForExport = async (filters = {}) => {
  let query = supabase
    .from(TABLES.USERS)
    .select('*')
    .neq('status', 'deleted')
    .neq('role', 'admin')
    .order('created_at', { ascending: false });

  if (filters.district) query = query.eq('district', filters.district);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.gender)   query = query.eq('gender', filters.gender);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(_toUserShape);
};

export const searchMembers = async (field, value) => {
  const dbField = _toDbField(field);
  let query = supabase
    .from(TABLES.USERS)
    .select('*')
    .neq('status', 'deleted')
    .neq('role', 'admin')
    .limit(50);

  // Use ilike for text fields, eq for exact match fields
  if (dbField === 'membership_id' || dbField === 'mobile' || dbField === 'aadhaar') {
    query = query.ilike(dbField, `${value}%`);
  } else {
    query = query.ilike(dbField, `%${value}%`); // contains search for name
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(_toUserShape);
};

// ── Statistics ──

export const getMemberCount = async () => {
  const { count } = await supabase
    .from(TABLES.USERS)
    .select('*', { count: 'exact', head: true })
    .in('status', ['active', 'inactive', 'pending']);
  return count || 0;
};

export const getTodayRegistrations = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data } = await supabase
    .from(TABLES.USERS)
    .select('id')
    .neq('status', 'deleted')
    .gte('created_at', today.toISOString());
  return data?.length || 0;
};

export const getMembersByDistrict = async () => {
  const { data } = await supabase
    .from(TABLES.USERS)
    .select('district')
    .neq('status', 'deleted');

  const distribution = {};
  (data || []).forEach(({ district }) => {
    const d = district || 'Unknown';
    distribution[d] = (distribution[d] || 0) + 1;
  });
  return distribution;
};

export const getMonthlyRegistrations = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data } = await supabase
    .from(TABLES.USERS)
    .select('created_at')
    .neq('status', 'deleted')
    .gte('created_at', sixMonthsAgo.toISOString())
    .order('created_at', { ascending: true });

  const monthly = {};
  (data || []).forEach(({ created_at }) => {
    if (created_at) {
      const date = new Date(created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = (monthly[key] || 0) + 1;
    }
  });
  return monthly;
};

// ── Settings ──

export const getSettings = async () => {
  const { data } = await supabase
    .from(TABLES.SETTINGS)
    .select('*')
    .eq('id', 'global')
    .single();
  return data || { validityYear: 2027, organizationName: 'Tamilnadu Silambattam Association' };
};

export const updateSettings = async (settingsData) => {
  const { error } = await supabase.from(TABLES.SETTINGS).upsert({
    id:         'global',
    ...settingsData,
    updated_at: serverTimestamp(),
  }, { onConflict: 'id' });
  if (error) throw error;
};

// ── Real-time listener ──

/**
 * Subscribe to real-time updates for a user document
 * Calls callback immediately with current data, then on every change
 */
export const subscribeToUser = (uid, callback) => {
  let active = true;
  let retryCount = 0;
  const maxRetries = 10;
  let timeoutId = null;

  const fetchUser = async () => {
    try {
      const data = await getUserById(uid);
      if (!active) return;
      
      if (data) {
        callback(data);
      } else if (retryCount < maxRetries) {
        retryCount++;
        timeoutId = setTimeout(fetchUser, 1000); // retry every 1 second
      } else {
        callback(null); // final fallback
      }
    } catch (err) {
      if (active) callback(null);
    }
  };

  fetchUser();

  // Subscribe to real-time changes on this row
  const channel = supabase
    .channel(`member-${uid}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLES.USERS, filter: `id=eq.${uid}` },
      (payload) => {
        if (active) {
          callback(payload.new ? _toUserShape(payload.new) : null);
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    active = false;
    if (timeoutId) clearTimeout(timeoutId);
    supabase.removeChannel(channel);
  };
};

// ── Shape converter: DB snake_case → app camelCase ──
const _toUserShape = (row) => ({
  id:           row.id,
  uid:          row.id,
  membershipId: row.membership_id,
  name:         row.name,
  fatherName:   row.father_name,
  dob:          row.dob,
  gender:       row.gender,
  aadhaar:      row.aadhaar,
  mobile:       row.mobile,
  email:        row.email,
  address:      row.address,
  district:     row.district,
  districtCode: row.district_code,
  clubName:     row.club_name,
  category:     row.category,
  position:     row.position,
  photoURL:     row.photo_url,
  role:         row.role,
  status:       row.status,
  createdAt:    row.created_at,
  updatedAt:    row.updated_at,
});

const _toDbField = (field) => {
  const map = {
    name: 'name', membershipId: 'membership_id', mobile: 'mobile',
    email: 'email', district: 'district', clubName: 'club_name',
  };
  return map[field] || field;
};

export { supabase as db };
