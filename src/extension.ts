import * as vscode from "vscode";
const name = "Compare View";
const tabLabelRegex = /^\bCompare View \b\d+$/;
const diffViewLabelRegex = /^\bCompare View \b\d+\b ↔ \b\bCompare View \b\d+$/;
const viewCountRegex = /(?<=Compare View )\d+/g;
let count: number;

export function activate(context: vscode.ExtensionContext) {
  updateViewCount();
  subscribeCloseEvent();
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "compare-view.compareView",
      createCompareView
    )
  );
}

const createCompareView = () => {
  let first = vscode.Uri.parse(`untitled:/${name} ${++count}`);
  vscode.commands.executeCommand("vscode.open", first);
  vscode.commands.executeCommand(
    "vscode.diff",
    first,
    vscode.Uri.parse(`untitled:/${name} ${++count}`)
  );
};

const updateViewCount = () => {
  const labels = vscode.window.tabGroups.all
    .flatMap(({ tabs }) => tabs)
    .filter((tab) => {
      return diffViewLabelRegex.test(tab.label);
    })
    .map((tab) => tab.label);
  if (labels && labels.length > 0) {
    let nums: number[] = [];
    labels.forEach((label) => {
      label.match(/\d+/g)?.forEach((v) => {
        nums.push(Number(v));
      });
    });
    count = Math.max.apply(null, nums);
  } else {
    count = 0;
  }
};

const closeCompareView = (path: string) => {
  vscode.window.tabGroups.all
    .flatMap(({ tabs }) => tabs)
    .forEach((tab) => {
      if (tab.input!.constructor.name === "pi") {
        if (((tab.input as any).uri! as vscode.Uri).path === path) {
          vscode.window.tabGroups.close(tab);
        }
      }
    });
};

const subscribeCloseEvent = () => {
  vscode.window.tabGroups.onDidChangeTabs((e) => {
    const compareViewClosed = e.closed.filter((tab) => {
      return diffViewLabelRegex.test(tab.label);
    });

    compareViewClosed.forEach((view) => {
      const viewCounts = view.label.match(viewCountRegex);
      if (viewCounts) {
        const tabs = vscode.window.tabGroups.all.flatMap(({ tabs }) => tabs)
        viewCounts.forEach((viewCount) => {
          tabs.forEach((tab) => {
            if (tab.input!.constructor.name === "pi") {
              if (((tab.input as any).uri! as vscode.Uri).path === `/${name} ${viewCount}`) {
                vscode.window.tabGroups.close(tab);
              }
            }
          })
        })
      }
      // view.label.match(viewCountRegex)?.forEach((match) => {
      //   closeCompareView(`/${name} ${match}`);
      // });
    });
  });
};
