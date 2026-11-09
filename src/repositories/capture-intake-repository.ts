import { db } from '../db';
import type { CaptureIntake } from '../types';

export async function takeCaptureIntake(id: string): Promise<CaptureIntake | undefined> {
  return db.transaction('rw', db.captureIntake, async () => {
    const intake = await db.captureIntake.get(id);
    if (intake) await db.captureIntake.delete(id);
    return intake;
  });
}
