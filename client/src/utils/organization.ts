/**
 * Utility to classify tenant organizations into Higher Education Institutes / Universities.
 */

export function isSchoolOrganization(_item: any): boolean {
  return false;
}

export function isInstituteOrganization(item: any): boolean {
  if (!item) return false;
  const raw =
    typeof item === 'string'
      ? item
      : item.institutionType || item.type || item.tenantType || item.tier || '';
  const normalized = String(raw).trim().toLowerCase();
  if (!normalized) {
    return false;
  }
  if (
    normalized === 'independent' ||
    normalized === 'individual' ||
    normalized === 'self-enrolled' ||
    normalized === 'unaffiliated'
  ) {
    return false;
  }
  return true;
}

export function isCollegeOrganization(item: any): boolean {
  return isInstituteOrganization(item);
}
