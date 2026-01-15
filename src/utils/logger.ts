/**
 * Logger utility for handling verbosity levels.
 * Controls console output based on VITE_VERBOSITY_LEVEL environment variable.
 * Levels:
 * 0 - Silent
 * 1 - Error
 * 2 - Warn
 * 3 - Info
 * 4 - Debug (Full payloads)
 */

const getVerbosityLevel = (): number => {
    if (typeof import.meta.env !== 'undefined') {
        return Number(import.meta.env.VITE_VERBOSITY_LEVEL) || 0;
    }
    return 0;
};

export const logger = {
    error: (message: string, ...args: any[]) => {
        if (getVerbosityLevel() >= 1) console.error(`[ERROR] ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
        if (getVerbosityLevel() >= 2) console.warn(`[WARN] ${message}`, ...args);
    },
    info: (message: string, ...args: any[]) => {
        if (getVerbosityLevel() >= 3) console.info(`[INFO] ${message}`, ...args);
    },
    debug: (message: string, ...args: any[]) => {
        if (getVerbosityLevel() >= 4) {
            console.log(`[DEBUG] ${message}`, ...args);
            if (args.length > 0) {
                try {
                    console.dir(args, { depth: null, colors: true });
                } catch (e) {
                    // Fallback for environments where dir might fail or behave differently
                    console.log(JSON.stringify(args, null, 2));
                }
            }
        }
    }
};
