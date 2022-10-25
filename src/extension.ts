import * as vscode from "vscode";
import { Tab } from "vscode";
const name = "Compare View";
const tabRegex = /\bCompare View \b\d+\b ↔ \b\bCompare View \b\d+/;
export function activate(context: vscode.ExtensionContext) {
  let count: number;
  const labels = vscode.window.tabGroups.all.flatMap(({ tabs }) => tabs)
    .filter((tab) => {
      return tabRegex.test(tab.label);
    })
    .map((tab) => tab.label);
  if (labels && labels.length > 0) {
    let nums: number[] = [];
    labels.forEach(label => {
      label.match(/\d+/g)?.forEach(v => { nums.push(Number(v)); });
    });
    count = Math.max.apply(null, nums);
  } else {
    count = 0;
  }
  let disposable = vscode.commands.registerCommand(
    "compare-view.compareView",
    () => {
      vscode.commands.executeCommand(
        "vscode.diff",
        vscode.Uri.parse(`untitled:/${name} ${++count}`),
        vscode.Uri.parse(`untitled:/${name} ${++count}`)
      );
    }
  );
  context.subscriptions.push(disposable);
}
