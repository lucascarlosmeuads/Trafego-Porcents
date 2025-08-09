
export function applyTemplate(template: string, vars: Record<string, string | undefined | null>) {
  let result = template || '';
  Object.entries(vars).forEach(([key, value]) => {
    const val = (value ?? '').toString();
    const re = new RegExp(`{{\\s*${escapeRegExp(key)}\\s*}}`, 'gi');
    result = result.replace(re, val);
  });
  return result;
}

export function getFirstName(name?: string | null) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  return parts[0] || '';
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
