// Tamil Nadu - 38 Districts with Official TNSA Codes
// Format: {SHORT}-{NO}-TNSA  (e.g. ARL-001-TNSA)
// Membership ID format: ARL-001-TNSA-1, ARL-001-TNSA-2, ...

export const DISTRICTS = [
  { id: 1,  name: 'Ariyalur',         code: 'ARL', fullCode: 'ARL-001-TNSA' },
  { id: 2,  name: 'Chengalpattu',     code: 'CGL', fullCode: 'CGL-002-TNSA' },
  { id: 3,  name: 'Chennai',          code: 'CHE', fullCode: 'CHE-003-TNSA' },
  { id: 4,  name: 'Coimbatore',       code: 'CBE', fullCode: 'CBE-004-TNSA' },
  { id: 5,  name: 'Cuddalore',        code: 'CUD', fullCode: 'CUD-005-TNSA' },
  { id: 6,  name: 'Dharmapuri',       code: 'DPM', fullCode: 'DPM-006-TNSA' },
  { id: 7,  name: 'Dindigul',         code: 'DGL', fullCode: 'DGL-007-TNSA' },
  { id: 8,  name: 'Erode',            code: 'ERD', fullCode: 'ERD-008-TNSA' },
  { id: 9,  name: 'Kallakurichi',     code: 'KKI', fullCode: 'KKI-009-TNSA' },
  { id: 10, name: 'Kanchipuram',      code: 'KPM', fullCode: 'KPM-010-TNSA' },
  { id: 11, name: 'Kanniyakumari',    code: 'KKM', fullCode: 'KKM-011-TNSA' },
  { id: 12, name: 'Karur',            code: 'KAR', fullCode: 'KAR-012-TNSA' },
  { id: 13, name: 'Krishnagiri',      code: 'KGI', fullCode: 'KGI-013-TNSA' },
  { id: 14, name: 'Madurai',          code: 'MDU', fullCode: 'MDU-014-TNSA' },
  { id: 15, name: 'Mayiladuthurai',   code: 'MYD', fullCode: 'MYD-015-TNSA' },
  { id: 16, name: 'Nagapattinam',     code: 'NGP', fullCode: 'NGP-016-TNSA' },
  { id: 17, name: 'Namakkal',         code: 'NMK', fullCode: 'NMK-017-TNSA' },
  { id: 18, name: 'Nilgiris',         code: 'NLG', fullCode: 'NLG-018-TNSA' },
  { id: 19, name: 'Perambalur',       code: 'PBL', fullCode: 'PBL-019-TNSA' },
  { id: 20, name: 'Pudukkottai',      code: 'PDK', fullCode: 'PDK-020-TNSA' },
  { id: 21, name: 'Ramanathapuram',   code: 'RMD', fullCode: 'RMD-021-TNSA' },
  { id: 22, name: 'Ranipet',          code: 'RPT', fullCode: 'RPT-022-TNSA' },
  { id: 23, name: 'Salem',            code: 'SLM', fullCode: 'SLM-023-TNSA' },
  { id: 24, name: 'Sivaganga',        code: 'SVG', fullCode: 'SVG-024-TNSA' },
  { id: 25, name: 'Tenkasi',          code: 'TKS', fullCode: 'TKS-025-TNSA' },
  { id: 26, name: 'Thanjavur',        code: 'TNJ', fullCode: 'TNJ-026-TNSA' },
  { id: 27, name: 'Theni',            code: 'THN', fullCode: 'THN-027-TNSA' },
  { id: 28, name: 'Thoothukudi',      code: 'TTK', fullCode: 'TTK-028-TNSA' },
  { id: 29, name: 'Tiruchirappalli',  code: 'TRY', fullCode: 'TRY-029-TNSA' },
  { id: 30, name: 'Tirunelveli',      code: 'TNV', fullCode: 'TNV-030-TNSA' },
  { id: 31, name: 'Tirupathur',       code: 'TPR', fullCode: 'TPR-031-TNSA' },
  { id: 32, name: 'Tiruppur',         code: 'TUP', fullCode: 'TUP-032-TNSA' },
  { id: 33, name: 'Tiruvallur',       code: 'TVL', fullCode: 'TVL-033-TNSA' },
  { id: 34, name: 'Tiruvannamalai',   code: 'TVM', fullCode: 'TVM-034-TNSA' },
  { id: 35, name: 'Tiruvarur',        code: 'TVR', fullCode: 'TVR-035-TNSA' },
  { id: 36, name: 'Vellore',          code: 'VLR', fullCode: 'VLR-036-TNSA' },
  { id: 37, name: 'Viluppuram',       code: 'VPM', fullCode: 'VPM-037-TNSA' },
  { id: 38, name: 'Virudhunagar',     code: 'VNR', fullCode: 'VNR-038-TNSA' },
];

// Map for quick lookup by code (short)
export const DISTRICT_BY_CODE = DISTRICTS.reduce((acc, d) => {
  acc[d.code] = d;
  return acc;
}, {});

// Map for quick lookup by full code
export const DISTRICT_BY_FULL_CODE = DISTRICTS.reduce((acc, d) => {
  acc[d.fullCode] = d;
  return acc;
}, {});

// Map for quick lookup by name
export const DISTRICT_BY_NAME = DISTRICTS.reduce((acc, d) => {
  acc[d.name] = d;
  return acc;
}, {});

// Get district short code from district name
export const getDistrictCode = (districtName) => {
  const district = DISTRICT_BY_NAME[districtName];
  return district ? district.code : null;
};

// Get district full code from district name (e.g. 'ARL-001-TNSA')
export const getDistrictFullCode = (districtName) => {
  const district = DISTRICT_BY_NAME[districtName];
  return district ? district.fullCode : null;
};
