const vscode = require("vscode");
const { LabelManager } = require("../LabelManager");

async function lookupQuickPick(labels) {
  let key = await vscode.window.showQuickPick(Object.keys(labels));

  if (labels[key]) {
    vscode.window.showInformationMessage(new LabelManager().statusConfig);
    vscode.window.showInformationMessage(`${key}`);
    vscode.window.showInformationMessage(`${labels[key]}`);
  }
}

function labelLookup() {
  let labels = new LabelManager().labels;

  if (labels) {
    lookupQuickPick(labels);
  }
}

function reverseLabelLookup() {
  const labels = new LabelManager().labelsReversed;

  if (labels) {
    lookupQuickPick(labels);
  }
}

module.exports = {
  labelLookup,
  reverseLabelLookup,
};
