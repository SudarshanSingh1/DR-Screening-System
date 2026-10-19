import test from 'node:test';
import assert from 'node:assert';
import path from 'path';
import { getFilePath } from '../utils/storage';

test('Storage Utils - getFilePath resolves expected storage key', () => {
  const testKey = 'screenings/123/left-eye.jpg';
  const resolved = getFilePath(testKey);
  
  assert.ok(resolved.endsWith(path.join('uploads', 'screenings', '123', 'left-eye.jpg')) || resolved.includes(testKey));
  assert.strictEqual(typeof resolved, 'string');
});

test('Storage Utils - getFilePath handles nested directory paths', () => {
  const reportKey = 'reports/referral-report-456.pdf';
  const resolved = getFilePath(reportKey);
  
  assert.ok(resolved.includes(path.normalize(reportKey)));
});
