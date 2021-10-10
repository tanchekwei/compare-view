import * as vscode from 'vscode';
export function activate(context: vscode.ExtensionContext) {
	let count: number = 0;
	let disposable = vscode.commands.registerCommand('compare-view.compareView', () => {
		vscode.commands.executeCommand(
			"vscode.diff",
			vscode.Uri.parse(`untitled:/Compare View ${(count * 2) + 1}`),
			vscode.Uri.parse(`untitled:/Compare View ${(count * 2) + 2}`));
		count++;
	});
	context.subscriptions.push(disposable);
}
