import { getCaptureIntake } from '../repositories/capture-intake-repository';
import type { CaptureIntake } from '../types';

export async function loadShareIntake(id: string): Promise<CaptureIntake | null> {
  return (await getCaptureIntake(id)) ?? null;
}
