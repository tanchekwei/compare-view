import {
  window,
  commands,
  ExtensionContext,
  Uri,
  workspace,
  Tab,
  TabInputTextDiff,
  TabInputText,
} from "vscode";
const name = "Compare View ";
const arrow = " ↔ ";
const scheme = "untitled";
const section = "compareView";
const tabNoRegex = new RegExp(`(?<=\\b${name}\\b)\\d+`, "g");
const compareViewTabPathRegex = new RegExp(`\\/\\b${name}\\b\\d+$`); // do not set global flag, to prevent lastIndex being set
const compareViewDiffTabLabelRegex = new RegExp(
  `^\\b${name}\\b\\d+\\b${arrow}${name}\\b\\d+$`
);
let count: number = 0;
let closeRelatedTab: boolean = false;

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("compare-view.compareView", createCompareView)
  );
  initCount();
  setConfiguration();
  subscribeCloseEvent();
  subscribeConfigChangedEvent();
}

const createCompareView = () => {
  const leftName = `${name}${++count}`;
  const leftUri = Uri.parse(`${scheme}:/${leftName}`);
  const rightName = `${name}${++count}`;
  const rightUri = Uri.parse(`${scheme}:/${rightName}`);
  window
    .showTextDocument(rightUri)
    .then(() =>
      commands.executeCommand(
        "vscode.diff",
        leftUri,
        rightUri,
        `${leftName}${arrow}${rightName}`
      )
    );
};

const setConfiguration = () => {
  closeRelatedTab = workspace
    .getConfiguration(section)
    .get("closeRelatedTab") as boolean;
};

const subscribeConfigChangedEvent = () => {
  workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration(section)) {
      setConfiguration();
    }
  });
};

const initCount = () => {
  window.tabGroups.all
    .flatMap(({ tabs }) => tabs)
    .filter((tab) => {
      return isCompareViewTab(tab) || isCompareViewDiffTab(tab);
    })
    .map((tab) => tab.label)
    .forEach((label) => {
      label.match(tabNoRegex)?.forEach((viewCount) => {
        count = Math.max(count, parseInt(viewCount));
      });
    });
};

const subscribeCloseEvent = () => {
  window.tabGroups.onDidChangeTabs((e) => {
    if (e.closed.length === 0 || !closeRelatedTab) {
      return;
    }
    e.closed
      .filter((tab) => {
        return isCompareViewDiffTab(tab);
      })
      .forEach((tab) => {
        const tabToClose: string[] = [];
        tab.label.match(tabNoRegex)?.forEach((count) => {
          tabToClose.push(`/${name}${count}`);
        });
        if (tabToClose.length === 0) {
          return;
        }
        window.tabGroups.all
          .flatMap(({ tabs }) => tabs)
          .filter((tab) => {
            return (
              isCompareViewTab(tab) &&
              tabToClose.includes(((tab.input as any).uri! as Uri).path)
            );
          })
          .forEach((tab) => {
            window.tabGroups.close(tab);
          });
      });
  });
};

const isCompareViewDiffTab = (tab: Tab): boolean => {
  return (
    tab.input instanceof TabInputTextDiff &&
    compareViewDiffTabLabelRegex.test(tab.label)
  );
};

const isCompareViewTab = (tab: Tab): boolean => {
  return (
    tab.input instanceof TabInputText &&
    tab.input.uri.scheme === scheme &&
    compareViewTabPathRegex.test(tab.input.uri.path)
  );
};
