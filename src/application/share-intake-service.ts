import { takeCaptureIntake } from '../repositories/capture-intake-repository';

export async function consumeShareIntake(id: string): Promise<string | null> {
  const intake = await takeCaptureIntake(id);
  return intake?.url ?? null;
}
