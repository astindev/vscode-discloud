import { TreeItem } from "../../functions/api/tree";
import { requester } from "../../functions/requester";
import { Command } from "../../structures/command";
import { Discloud } from "../../structures/extend";
import * as vscode from 'vscode';
import { writeFileSync } from "fs";
import { AppLog, Logs } from "../../types/apps";
import { join } from "path";

export = class extends Command {

    constructor(discloud: Discloud) {
        super(discloud, {
            name: "logsEntry"
        });
    }

    run = async (item: TreeItem) => {
        const token = this.discloud.config.get("token") as string;
        if (!token) {
            return;
        }
        
        const logs: Logs = await requester('get', `/app/${item.tooltip}/logs`, {
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "api-token": token
            }
        });

        if (!logs) { return; }

        const ask = await vscode.window.showInformationMessage("Logs acessadas com sucesso. Selecione uma das Opções:", "Abrir Arquivo", `Abrir Link`);
        if (ask === "Abrir Arquivo") {
            await writeFileSync(join(__filename, "..", "..", "..", `${(<AppLog>logs.apps).id}.log`), (<AppLog>logs.apps).terminal.big);
            const fileToOpenUri: vscode.Uri = await vscode.Uri.file(join(__filename, "..", "..", "..", `${(<AppLog>logs.apps).id}.log`));
            return vscode.window.showTextDocument(fileToOpenUri, { viewColumn: vscode.ViewColumn.Beside });
        } else if (ask === "Abrir Link") {
            return vscode.env.openExternal(vscode.Uri.parse(`${(<AppLog>logs.apps).terminal.url}`));
        }
    };
};
