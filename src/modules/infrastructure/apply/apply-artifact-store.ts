import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

/**
 * Persists apply-run screenshots/HTML under storage/artifacts (gitignored).
 */
export class ApplyArtifactStore {
  constructor(private readonly rootDir = path.join(process.cwd(), 'storage', 'artifacts')) {}

  /**
   * Ensures a per-application artifact directory exists and returns its path.
   */
  async ensureDir(applicationId: string): Promise<string> {
    const dir = path.join(this.rootDir, 'apply', applicationId, String(Date.now()));
    await mkdir(dir, { recursive: true });
    return dir;
  }

  /**
   * Writes a UTF-8 text artifact and returns the absolute path.
   */
  async writeText(dir: string, fileName: string, contents: string): Promise<string> {
    const filePath = path.join(dir, fileName);
    await writeFile(filePath, contents, 'utf8');
    return filePath;
  }
}
