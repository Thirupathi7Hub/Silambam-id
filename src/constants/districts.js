// Tamil Nadu - 38 Districts with Official Short Forms
// Source: TNSA Official District Code Document

export const DISTRICTS = [
  { id: 1,  name: 'Ariyalur',         code: 'ARL' },
  { id: 2,  name: 'Chengalpattu',     code: 'CGL' },
  { id: 3,  name: 'Chennai',          code: 'CHE' },
  { id: 4,  name: 'Coimbatore',       code: 'CBE' },
  { id: 5,  name: 'Cuddalore',        code: 'CUD' },
  { id: 6,  name: 'Dharmapuri',       code: 'DPM' },
  { id: 7,  name: 'Dindigul',         code: 'DGL' },
  { id: 8,  name: 'Erode',            code: 'ERD' },
  { id: 9,  name: 'Kallakurichi',     code: 'KKI' },
  { id: 10, name: 'Kanchipuram',      code: 'KPM' },
  { id: 11, name: 'Kanniyakumari',    code: 'KKM' },
  { id: 12, name: 'Karur',            code: 'KAR' },
  { id: 13, name: 'Krishnagiri',      code: 'KGI' },
  { id: 14, name: 'Madurai',          code: 'MDU' },
  { id: 15, name: 'Mayiladuthurai',   code: 'MYD' },
  { id: 16, name: 'Nagapattinam',     code: 'NGP' },
  { id: 17, name: 'Namakkal',         code: 'NMK' },
  { id: 18, name: 'Nilgiris',         code: 'NLG' },
  { id: 19, name: 'Perambalur',       code: 'PBL' },
  { id: 20, name: 'Pudukkottai',      code: 'PDK' },
  { id: 21, name: 'Ramanathapuram',   code: 'RMD' },
  { id: 22, name: 'Ranipet',          code: 'RPT' },
  { id: 23, name: 'Salem',            code: 'SLM' },
  { id: 24, name: 'Sivaganga',        code: 'SVG' },
  { id: 25, name: 'Tenkasi',          code: 'TKS' },
  { id: 26, name: 'Thanjavur',        code: 'TNJ' },
  { id: 27, name: 'Theni',            code: 'THN' },
  { id: 28, name: 'Thoothukudi',      code: 'TTK' },
  { id: 29, name: 'Tiruchirappalli',  code: 'TRY' },
  { id: 30, name: 'Tirunelveli',      code: 'TNV' },
  { id: 31, name: 'Tirupathur',       code: 'TPR' },
  { id: 32, name: 'Tiruppur',         code: 'TUP' },
  { id: 33, name: 'Tiruvallur',       code: 'TVL' },
  { id: 34, name: 'Tiruvannamalai',   code: 'TVM' },
  { id: 35, name: 'Tiruvarur',        code: 'TVR' },
  { id: 36, name: 'Vellore',          code: 'VLR' },
  { id: 37, name: 'Viluppuram',       code: 'VPM' },
  { id: 38, name: 'Virudhunagar',     code: 'VNR' },
];

// Map for quick lookup by code
export const DISTRICT_BY_CODE = DISTRICTS.reduce((acc, d) => {
  acc[d.code] = d;
  return acc;
}, {});

// Map for quick lookup by name
export const DISTRICT_BY_NAME = DISTRICTS.reduce((acc, d) => {
  acc[d.name] = d;
  return acc;
}, {});

// Get district code from district name
export const getDistrictCode = (districtName) => {
  const district = DISTRICT_BY_NAME[districtName];
  return district ? district.code : null;
};
