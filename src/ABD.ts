import { ADBResponse } from './types';
import { ADBShell } from './utils';

/**
 * ADB class to execute ADB shell commands.
 */
export default class ADB {
    /**
     * Executes an ADB shell command.
     *
     * @param {string} command - The command to execute.
     * @returns {Promise<void>} A promise that resolves when the command execution is complete.
     */
    public async execCommand(command: string): Promise<ADBResponse> {
        return await ADBShell(command);
    }
}
