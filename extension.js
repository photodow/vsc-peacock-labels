// get label text value english by default
// get label translated value
// get label by device
// get all other references of the label in codelense
// label linting...
// autocomplete/suggestion of label (Language Server)

const vscode = require("vscode");
const { getLabelAtPosition } = require("./src/getLabelKey");
const { getLabels } = require("./src/getLabels");
const { HoverLabelValue } = require("./src/HoverLabelValue");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const selector = [
    { scheme: "file", language: "typescript" },
    { scheme: "file", language: "javascript" },
  ];

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(selector, new HoverLabelValue())
  );

  //   vscode.languages.registerCodeLensProvider(selector, {
  //     provideCodeLenses(doc, cancelToken) {
  //       console.log(doc);
  //       console.log(doc.lineCount);
  //       console.log(doc.lineAt(doc.lineCount - 1));

  //       let line = doc.lineAt(0);
  //       const codeLenses = [];

  //       while (!line._isLastLine) {
  //         const char = line.text.search(/['"`]\w+(\.\w+)+(?=['"`])/g);

  //         if (char > -1) {
  //           const label = getLabelAtPosition(
  //             doc,
  //             new vscode.Position(line.lineNumber, char)
  //           );
  //           console.log(line.lineNumber, label);

  //           let command = {
  //             command: "peacockLabels.labelLookup",
  //             title: "Peacock Label Lookup",
  //           };

  //           codeLenses.push(new vscode.CodeLens(label.range, command));
  //         }

  //         line = doc.lineAt(line.lineNumber + 1);
  //       }

  //       console.log(codeLenses);

  //       return codeLenses;
  //     },
  //   });

  context.subscriptions.push(
    vscode.commands.registerCommand("peacockLabels.labelLookup", async () => {
      let allLables = await getLabels();

      if (allLables.data) {
        allLables = allLables.data;

        let labelKey = await vscode.window.showQuickPick(
          Object.keys(allLables).sort()
        );

        if (allLables[labelKey]) {
          vscode.window.showInformationMessage(
            `"${allLables[labelKey]}" (${labelKey})`
          );
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "peacockLabels.reverseLabelLookup",
      async () => {
        let allLables = await getLabels();

        if (allLables.data) {
          allLables = allLables.data;
          const reverseAllLables = {};

          Object.keys(allLables).forEach((key) => {
            if (allLables[key]) {
              reverseAllLables[allLables[key]] = key;
            }
          });

          let labelKey = await vscode.window.showQuickPick(
            Object.keys(reverseAllLables).sort()
          );

          if (reverseAllLables[labelKey]) {
            vscode.window.showInformationMessage(
              `(${reverseAllLables[labelKey]}) "${labelKey}"`
            );
          }
        }
      }
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
