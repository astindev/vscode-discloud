"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
const requester_1 = require("../../functions/requester");
const command_1 = require("../../structures/command");
const vscode = __importStar(require("vscode"));
const toLogs_1 = require("../../functions/toLogs");
module.exports = class extends command_1.Command {
    constructor(discloud) {
        super(discloud, {
            name: "logsEntry",
        });
    }
    run = async (item) => {
        const token = this.discloud.config.get("token");
        if (!token) {
            return;
        }
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Logs da Aplicação",
        }, async (progress, tk) => {
            const logs = await (0, requester_1.requester)(`/app/${item.tooltip}/logs`, {
                headers: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    "api-token": token,
                },
                method: "GET"
            });
            if (!logs) {
                return;
            }
            progress.report({
                message: "Logs da Aplicação - Logs recebidas com sucesso.",
                increment: 100,
            });
            return (0, toLogs_1.createLogs)("Logs acessadas com sucesso. Selecione uma das Opções:", {
                text: logs.apps.terminal.big,
            }, `${item.label?.toString().replaceAll(" ", "_").toLowerCase()}.log`);
        });
    };
};
//# sourceMappingURL=logs.js.map