/** Mirrors backend buildSequencedCompanyNames (replicate.js). */
export function buildSequencedCompanyNames(baseName, count, sequenceStart) {
    const base = String(baseName || '').trim();
    const total = Math.min(Math.max(Number(count) || 1, 1), 50);
    if (total === 1) return [base];
    const startRaw = String(sequenceStart ?? '01').trim() || '01';
    const startNum = Number.parseInt(startRaw, 10);
    const start = Number.isFinite(startNum) ? startNum : 1;
    const width = Math.max(startRaw.length, 2);
    return Array.from({ length: total }, (_, i) => `${base}${String(start + i).padStart(width, '0')}`);
}

export function companyRunLabel(baseName, count, sequenceStart) {
    const names = buildSequencedCompanyNames(baseName, count, sequenceStart);
    if (names.length <= 1) return names[0] || baseName;
    return `${names[0]} (+${names.length - 1})`;
}
