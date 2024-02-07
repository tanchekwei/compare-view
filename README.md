# Compare View

A simple extension to create two untitled files in compare view / diff view to paste in text for comparing, a shortcut to open two untitled files, click on `Select for Compare` and `Compare with Selected`.

![Create Compare View](https://i.imgur.com/7FKTtxt.gif)

## Features

`Ctrl + Shift + P` - which brings up the Command Palette, and search for `Create Compare View` command.

## Setting

`compareView.closeRelatedView` - Controls whether the extension will try to automatically close the related tab after the compare view is closed. Visual Studio Code will prompt the user to save or discard changes before allowing the tab to close. The extension cannot override this prompt. ([#2][#2])

`compareView.focusLeftSide` - Automatically sets the focus to the left side of the compare view when the compare view is created.

[#2]: https://github.com/tanchekwei/compare-view/issues/2
