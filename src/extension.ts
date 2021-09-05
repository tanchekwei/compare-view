import * as vscode from 'vscode';
export function activate(context: vscode.ExtensionContext) {
	const file1 = vscode.Uri.parse(`untitled:/CompareView1`);
	const file2 = vscode.Uri.parse(`untitled:/CompareView2`);
	let disposable = vscode.commands.registerCommand('compare-view.compareView', () => {
		vscode.commands.executeCommand("vscode.diff", file1, file2);
	});
	context.subscriptions.push(disposable);
}
