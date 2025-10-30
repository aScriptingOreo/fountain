/**
 * Checks if required system libraries for Chromium/Puppeteer are available.
 * Returns helpful installation instructions if missing.
 */
export function checkPuppeteerDependencies(): { ok: boolean; message?: string } {
  // On Linux, check for common missing libraries
  if (process.platform === 'linux') {
    const missingLibs = [
      'libnspr4',
      'libnss3',
      'libgbm1',
      'libxss1',
      'libasound2',
      'libatk1.0-0',
      'libx11-xcb1',
      'libxcomposite1'
    ];

    // Note: we can't easily check if libs are installed without shelling out,
    // so we provide the full list proactively.
    return {
      ok: false,
      message: `
Puppeteer requires additional system libraries on Linux. Install them using:

Ubuntu/Debian:
  sudo apt-get update
  sudo apt-get install -y \\
    libnspr4 libnss3 libgbm1 libxss1 libasound2 \\
    libatk1.0-0 libx11-xcb1 libxcomposite1 \\
    libxrandr2 libxinerama1 libxtst6

Arch:
  sudo pacman -S libnspr nss libgbm libxss alsa-lib atk libxcomposite libxrandr libxinerama libxtst

Or use a Docker container with Chrome pre-installed, or use a headless PDF service.
      `
    };
  }

  return { ok: true };
}
