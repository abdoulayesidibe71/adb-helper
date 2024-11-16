import { ADBShell } from './utils';

export default class ADB {

    // Méthode pour exécuter une commande ADB (peut être déplacée si non utilisée ici)
    private async execCommand(command: string): Promise<void> {
        await ADBShell(command);
    }
}
