import { describe, it, expect } from 'vitest';
import en from '../../messages/en.json';
import am from '../../messages/am.json';
import om from '../../messages/om.json';

function getKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  for (const k in obj) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      keys = keys.concat(getKeys(obj[k], next));
    } else {
      keys.push(next);
    }
  }
  return keys;
}

function getLeaves(obj: any, prefix = ''): { key: string; value: any }[] {
  let leaves: { key: string; value: any }[] = [];
  for (const k in obj) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      leaves = leaves.concat(getLeaves(obj[k], next));
    } else {
      leaves.push({ key: next, value: obj[k] });
    }
  }
  return leaves;
}

describe('Task 9 — Translation Parity and Coverage', () => {
  const enKeys = new Set(getKeys(en));
  const amKeys = new Set(getKeys(am));
  const omKeys = new Set(getKeys(om));

  it('Amharic (am.json) has 100% key parity with English (en.json)', () => {
    const missingInAm = [...enKeys].filter(k => !amKeys.has(k));
    const extraInAm = [...amKeys].filter(k => !enKeys.has(k));
    expect(missingInAm).toEqual([]);
    expect(extraInAm).toEqual([]);
  });

  it('Afaan Oromo (om.json) has 100% key parity with English (en.json)', () => {
    const missingInOm = [...enKeys].filter(k => !omKeys.has(k));
    const extraInOm = [...omKeys].filter(k => !enKeys.has(k));
    expect(missingInOm).toEqual([]);
    expect(extraInOm).toEqual([]);
  });

  it('Work section contains required liveUrl and case study translations', () => {
    expect((en as any).Work.visitLiveProject).toBe('Visit Live Project');
    expect((am as any).Work.visitLiveProject).toBeTruthy();
    expect((om as any).Work.visitLiveProject).toBeTruthy();

    expect((en as any).Work.projectOverview).toBe('Project Overview');
    expect((am as any).Work.projectOverview).toBeTruthy();
    expect((om as any).Work.projectOverview).toBeTruthy();
  });

  it('No translation leaf node has an empty or null value', () => {
    const enLeaves = getLeaves(en);
    const amLeaves = getLeaves(am);
    const omLeaves = getLeaves(om);

    for (const { key, value } of [...enLeaves, ...amLeaves, ...omLeaves]) {
      expect(typeof value).toBe('string');
      expect(value.trim().length, `Empty string at ${key}`).toBeGreaterThan(0);
    }
  });
});
