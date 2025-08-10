
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

export function normalizePlanTitle(markdown: string, nomeCliente?: string) {
  if (!nomeCliente || !nomeCliente.trim()) return markdown;
  const lines = markdown.split(/\r?\n/);
  const maxScan = Math.min(lines.length, 10);
  for (let i = 0; i < maxScan; i++) {
    const line = lines[i];
    if (/^#\s+/.test(line) && /\bcliente\b/i.test(line)) {
      lines[i] = line.replace(/\bcliente\b/gi, nomeCliente.trim());
      return lines.join("\n");
    }
  }
  return markdown;
}
