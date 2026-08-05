import { writeFile } from 'fs/promises';
import path from 'path';

/**
 * Ensures a resume file exists on disk for ATS file inputs.
 * Falls back to writing contentText as UTF-8 `.txt` under the artifacts dir.
 */
export async function materializeResumeFile(input: {
  resumeFilePath: string | null;
  resumeText: string;
  artifactsDir: string;
  preferredName?: string;
}): Promise<string | null> {
  if (input.resumeFilePath) {
    const absolute = path.isAbsolute(input.resumeFilePath)
      ? input.resumeFilePath
      : path.join(process.cwd(), input.resumeFilePath);
    return absolute;
  }

  const text = input.resumeText.trim();
  if (text.length < 20) {
    return null;
  }

  const safeName = (input.preferredName ?? 'resume')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
  const filePath = path.join(input.artifactsDir, `${safeName || 'resume'}.txt`);
  await writeFile(filePath, text, 'utf8');
  return filePath;
}
