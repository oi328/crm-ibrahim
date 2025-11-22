// Centralized organization structure for departments and teams
// Replace this with actual API calls when backend is ready

export const DEPARTMENTS = [
  { id: 'd-3001', name: 'Customer Support' },
  { id: 'd-3002', name: 'Sales' },
  { id: 'd-3003', name: 'Technical Support' },
]

export const TEAMS_BY_DEPARTMENT = {
  'Customer Support': ['Tier 1', 'Tier 2', 'Escalations'],
  'Sales': ['Inside Sales', 'Field Sales', 'Account Execs'],
  'Technical Support': ['Level 1', 'Level 2'],
}

export function getTeamsForDept(departmentName) {
  if (!departmentName) return []
  return TEAMS_BY_DEPARTMENT[departmentName] || []
}