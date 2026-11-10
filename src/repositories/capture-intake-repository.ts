import { db } from '../db';
import type { CaptureIntake } from '../types';

export async function getCaptureIntake(id: string): Promise<CaptureIntake | undefined> {
  return db.captureIntake.get(id);
}
