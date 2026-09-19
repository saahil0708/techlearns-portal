/**
 * Indian States, Major Cities Directory & Dynamic India Post PIN Code Lookup Engine
 */

export interface PincodeLookupResult {
  state: string;
  city: string;
  district: string;
  places: string[];
}

export const INDIAN_STATES_CITIES: Record<string, string[]> = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kakinada', 'Kurnool', 'Nellore', 'Rajahmundry', 'Anantapur', 'Eluru'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tezpur', 'Tinsukia'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Bihar Sharif'],
  'Chandigarh': ['Chandigarh'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Durg', 'Korba', 'Rajnandgaon'],
  'Delhi': ['New Delhi', 'Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Dwarka', 'Rohini', 'Okhla', 'Janakpuri', 'Saket'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Nadiad'],
  'Haryana': ['Gurugram', 'Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Rohtak', 'Hisar', 'Sonipat', 'Panchkula', 'Kurukshetra'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Hamirpur', 'Kullu', 'Bilaspur'],
  'Jammu & Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Kathua'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh'],
  'Karnataka': ['Bengaluru', 'Bangalore', 'Mysuru', 'Mysore', 'Mangaluru', 'Mangalore', 'Hubballi', 'Belagavi', 'Manipal', 'Udupi', 'Dharwad', 'Kalaburagi', 'Shivamogga', 'Tumakuru'],
  'Kerala': ['Thiruvananthapuram', 'Trivandrum', 'Kochi', 'Cochin', 'Kozhikode', 'Calicut', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Kannur', 'Kottayam'],
  'Ladakh': ['Leh', 'Kargil'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Navi Mumbai', 'Aurangabad', 'Chhatrapati Sambhaji Nagar', 'Kolhapur', 'Solapur', 'Amravati', 'Nanded'],
  'Manipur': ['Imphal', 'Churachandpur', 'Thoubal'],
  'Meghalaya': ['Shillong', 'Tura', 'Jowai'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Champhai'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur', 'Berhampur', 'Balasore', 'Puri'],
  'Puducherry': ['Puducherry', 'Pondicherry', 'Karaikal', 'Oulgaret'],
  'Punjab': ['Mohali', 'SAS Nagar', 'Chandigarh', 'Patiala', 'Jalandhar', 'Ludhiana', 'Amritsar', 'Bathinda', 'Phagwara', 'Rajpura', 'Banur', 'Hoshiarpur', 'Rupnagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur', 'Bikaner', 'Ajmer', 'Pilani', 'Alwar', 'Bhilwara', 'Sikar'],
  'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing'],
  'Tamil Nadu': ['Chennai', 'Madras', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Trichy', 'Salem', 'Vellore', 'Tirunelveli', 'Erode', 'Kanchipuram', 'Thanjavur'],
  'Telangana': ['Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar'],
  'Uttar Pradesh': ['Noida', 'Greater Noida', 'Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Allahabad', 'Ghaziabad', 'Meerut', 'Aligarh', 'Bareilly', 'Gorakhpur', 'Mathura'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh', 'Nainital', 'Pantnagar'],
  'West Bengal': ['Kolkata', 'Calcutta', 'Durgapur', 'Asansol', 'Howrah', 'Siliguri', 'Kharagpur', 'Bardhaman', 'Burdwan', 'Kalyani'],
};

export const INDIAN_STATES = Object.keys(INDIAN_STATES_CITIES).sort();

function cleanBlockName(block: string): string {
  if (!block || block.toUpperCase() === 'NA' || /^\d+$/.test(block)) return '';
  return block
    .replace(/\b(MC|MUNICIPAL CORPORATION|CORP|BLOCK|HQ|TALUK|TEHSIL)\b/gi, '')
    .trim();
}

function resolveCityName(
  postOffices: Array<{
    Name?: string;
    District?: string;
    Division?: string;
    Block?: string;
    BranchType?: string;
  }>,
  state: string
): { city: string; district: string; places: string[] } {
  const firstPo = postOffices[0] || {};
  const district = (firstPo.District || '').replace(/ district/i, '').trim();
  const division = (firstPo.Division || '').replace(/ division/i, '').trim();
  const knownCities = INDIAN_STATES_CITIES[state] || [];

  const allNames = postOffices.map((p) => p.Name || '').filter(Boolean);
  const blocks = postOffices.map((p) => cleanBlockName(p.Block || '')).filter(Boolean);

  // 1. Prioritize major known cities in the state that match block, division, district, or any post office name
  for (const kc of knownCities) {
    const kcLower = kc.toLowerCase();
    // Check block (e.g. "Durgapur Mc" -> "Durgapur")
    if (blocks.some((b) => b.toLowerCase().includes(kcLower) || kcLower.includes(b.toLowerCase()))) {
      return finish(kc);
    }
    // Check division (e.g. "Asansol")
    if (division && (division.toLowerCase().includes(kcLower) || kcLower.includes(division.toLowerCase()))) {
      return finish(kc);
    }
    // Check district (e.g. "Bardhaman" / "Patiala" / "Pune")
    if (district && (district.toLowerCase().includes(kcLower) || kcLower.includes(district.toLowerCase()))) {
      return finish(kc);
    }
    // Check PO names
    if (allNames.some((n) => n.toLowerCase().includes(kcLower))) {
      return finish(kc);
    }
  }

  // 2. If a clean block/taluk name exists (e.g. "Rajpura", "Banur", "Durgapur")
  if (blocks.length > 0 && blocks[0].length >= 3) {
    return finish(blocks[0]);
  }

  // 3. If district is available
  if (district && district.length >= 3) {
    return finish(district);
  }

  // 4. Fallback to division or primary town name
  return finish(division || allNames[0] || 'City');

  function finish(chosenCity: string) {
    const places = Array.from(new Set([chosenCity, district, ...blocks, ...allNames].filter(Boolean)));
    return { city: chosenCity, district, places };
  }
}

/**
 * Auto-detect City, District and State from any 6-digit Indian PIN Code using live India Post API
 */
export async function lookupPincode(pincode: string): Promise<PincodeLookupResult | null> {
  const cleanPin = pincode.replace(/\D/g, '').slice(0, 6);
  if (cleanPin.length !== 6) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (
        Array.isArray(data) &&
        data[0]?.Status === 'Success' &&
        Array.isArray(data[0]?.PostOffice) &&
        data[0].PostOffice.length > 0
      ) {
        const postOffices = data[0].PostOffice;
        const state = postOffices[0].State || '';
        const { city, district, places } = resolveCityName(postOffices, state);

        if (state) {
          return {
            state,
            city,
            district,
            places,
          };
        }
      }
    }
  } catch {
    // Network timeout or offline
  }

  return null;
}
