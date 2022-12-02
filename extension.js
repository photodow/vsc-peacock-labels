// TODO: status updates on loading
// TODO: better quick input lookup features
// TODO: registerInlineCompletionItemProvider; inline translation?

const vscode = require("vscode");
const {
  labelLookup,
  reverseLabelLookup,
} = require("./src/commands/labelLookup");
const { LabelManager } = require("./src/LabelManager");
const { LabelHoverProvider } = require("./src/providers/LabelHoverProvider");
const {
  LabelCompletionItemProvider,
} = require("./src/providers/LabelCompletionItemProvider");
const { LabelLinterProvider } = require("./src/providers/LabelLinterProvider");

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  const labelManager = new LabelManager();
  const selector = [
    { scheme: "file", language: "typescript" },
    { scheme: "file", language: "javascript" },
    { scheme: "file", language: "csv" },
    { scheme: "file", language: "json" },
    { scheme: "file", language: "plaintext" },
  ];

  await labelManager.init(); // initialize labels

  new LabelLinterProvider(context);

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      selector,
      new LabelCompletionItemProvider(),
      '"',
      "`",
      "'"
    )
  );

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(selector, new LabelHoverProvider())
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("peacockLabels.labelLookup", labelLookup)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "peacockLabels.reverseLabelLookup",
      reverseLabelLookup
    )
  );

  // vscode.languages.registerInlayHintsProvider(selector, {
  //   provideInlayHints(doc, range, cancelToken) {
  //     console.log(range.end);
  //     console.log(doc.position);

  //     const label = new vscode.InlayHintLabelPart("testing");
  //     label.value = "qwer";

  //     new MarkdownString(
  //       `<span style="background-color:#029cdf;">asdf</span>`,
  //       true
  //     );
  //     //   markdown.isTrusted = true;
  //     //   markdown.supportHtml = true;
  //     //   $(whole - word);
  //     label.tooltip = new MarkdownString(
  //       `<span style="background-color:#029cdf;">$(whole-word)</span>`,
  //       true
  //     );

  //     label.tooltip.isTrusted = true;
  //     label.tooltip.supportHtml = true;

  //     return [new vscode.InlayHint(range.end, [label], 2)];
  //   },
  // });

  // vscode.languages.registerCodeActionsProvider(selector, {
  //   provideCodeActions(doc, range, context, cancelToken) {
  //     console.log(doc);
  //     console.log(range);
  //     console.log(context);
  //     return [new vscode.CodeAction("asdf")];
  //   },
  // });
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
