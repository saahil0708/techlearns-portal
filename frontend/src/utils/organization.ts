/**
 * Utility to classify tenant organizations into Higher Education Colleges / Universities
 * versus Secondary Education High Schools / STEM Academies.
 */

export function isSchoolOrganization(item: any): boolean {
  if (!item) return false;

  // 1. Explicit tier, category, or type tags
  const tier = (item.tier || item.category || item.type || '').toLowerCase();
  if (
    tier.includes('school') ||
    tier.includes('k12') ||
    tier.includes('k-12') ||
    tier.includes('secondary') ||
    tier.includes('ap / ib') ||
    tier.includes('ap/ib')
  ) {
    return true;
  }

  // 2. Organization Code markers (e.g. STEM-SCH, NYC-SCH, STUY-HS)
  const code = (item.code || '').toUpperCase();
  if (
    code.endsWith('-SCH') ||
    code.endsWith('_SCH') ||
    code.startsWith('SCH-') ||
    code.startsWith('SCH_') ||
    code.endsWith('-HS') ||
    code.includes('K12')
  ) {
    return true;
  }

  // 3. Domain or email markers (e.g. .k12.edu, .schools.nyc.gov)
  const email = (item.email || '').toLowerCase();
  if (
    email.includes('.k12.') ||
    email.includes('k12.') ||
    email.includes('@school') ||
    email.includes('.school') ||
    email.includes('schools.')
  ) {
    return true;
  }

  // 4. Name markers
  const name = (item.name || '').toLowerCase();
  const schoolKeywords = [
    'high school',
    'secondary school',
    'grammar school',
    'k-12',
    'k12',
    'prep academy',
    'stem academy',
    'public school',
    'charter school',
  ];
  if (schoolKeywords.some((kw) => name.includes(kw))) {
    return true;
  }

  // If name has "school" and does not contain higher-ed keywords
  if (
    name.includes('school') &&
    !name.includes('college') &&
    !name.includes('university') &&
    !name.includes('institute')
  ) {
    return true;
  }

  return false;
}

export function isCollegeOrganization(item: any): boolean {
  return !isSchoolOrganization(item);
}
