import * as vscode from "vscode";
import { CommandHandler } from "./handlers/commandHandler";

export function activate(context: vscode.ExtensionContext) {
	const commandHandler = new CommandHandler(context);
	commandHandler.registerCommands(context);
}
