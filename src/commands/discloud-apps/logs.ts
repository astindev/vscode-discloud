import { TreeItem } from "../../functions/api/tree";
import { requester } from "../../functions/requester";
import { Command } from "../../structures/command";
import { Discloud } from "../../structures/extend";
import * as vscode from "vscode";
import { writeFileSync } from "fs";
import { AppLog, Logs } from "../../types/apps";
import { join } from "path";
import { createLogs } from "../../functions/toLogs";

export = class extends Command {
  constructor(discloud: Discloud) {
    super(discloud, {
      name: "logsEntry",
    });
  }

  run = async (item: TreeItem) => {
    const token = this.discloud.config.get("token") as string;
    if (!token) {
      return;
    }

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Logs da Aplicação",
      },
      async (progress, tk) => {
        const logs: Logs = await requester("get", `/app/${item.tooltip}/logs`, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "api-token": token,
          },
        });

        if (!logs) {
          return;
        }

        progress.report({
          message: "Logs da Aplicação - Logs recebidas com sucesso.",
          increment: 100,
        });

        return createLogs(
          "Logs acessadas com sucesso. Selecione uma das Opções:",
          {
            text: (<AppLog>logs.apps).terminal.big,
          },
          `${item.label?.toString().replaceAll(" ", "_").toLowerCase()}.log`
        );
      }
    );
  };
};
