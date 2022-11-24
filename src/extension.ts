import { window, commands, ExtensionContext, Uri } from "vscode";
const fileName = "Compare View ";
const untitledScheme = "untitled";
const compareViewLabelRegex = new RegExp(
  `^\\b${fileName}\\b\\d+\\b ↔ ${fileName}\\b\\d+$`
);
const viewCountRegex = new RegExp(`(?<=\\b${fileName}\\b)\\d+`, "g");
const singleViewLabelRegex = new RegExp(`\\b${fileName}\\b\\d+$`, "g");
let count: number = 0;

export function activate(context: ExtensionContext) {
  updateViewCount();
  subscribeCloseEvent();
  context.subscriptions.push(
    commands.registerCommand("compare-view.compareView", createCompareView)
  );
}

const createCompareView = () => {
  commands.executeCommand(
    "vscode.diff",
    Uri.parse(`${untitledScheme}:/${fileName}${++count}`),
    Uri.parse(`${untitledScheme}:/${fileName}${++count}`)
  );
};

const updateViewCount = () => {
  window.tabGroups.all
    .flatMap(({ tabs }) => tabs)
    .filter((tab) => {
      return singleViewLabelRegex.test(tab.label);
    })
    .map((tab) => tab.label)
    .forEach((label) => {
      label.match(viewCountRegex)?.forEach((viewCount) => {
        count = Math.max(count, parseInt(viewCount));
      });
    });
};

const subscribeCloseEvent = () => {
  window.tabGroups.onDidChangeTabs((e) => {
    e.closed
      .filter((tab) => {
        return (
          tab.input!.constructor.name === "vi" &&
          compareViewLabelRegex.test(tab.label)
        );
      })
      .forEach((tab) => {
        const closedTarget: string[] = [];
        tab.label.match(viewCountRegex)?.forEach((count) => {
          closedTarget.push(`/${fileName}${count}`);
        });
        if (closedTarget.length === 0) {
          return;
        }
        window.tabGroups.all
          .flatMap(({ tabs }) => tabs)
          .filter((tab) => {
            return (
              tab.input!.constructor.name === "pi" &&
              ((tab.input as any).uri! as Uri).scheme === untitledScheme &&
              closedTarget.includes(((tab.input as any).uri! as Uri).path)
            );
          })
          .forEach((tab) => {
            window.tabGroups.close(tab);
          });
      });
  });
};
