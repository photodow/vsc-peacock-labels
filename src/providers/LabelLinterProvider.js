const vscode = require("vscode");
const { LabelManager } = require("../LabelManager");
const {
  getLabelAtPosition,
  labelKeyRegExp,
} = require("../utils/getLabelAtPosition");

class LabelLinterProvider {
  constructor(context) {
    // lint all documents
    this.collection = vscode.languages.createDiagnosticCollection(
      "labelLinterCollection"
    );

    vscode.window.onDidChangeActiveTextEditor((e) => {
      this.lintDocument(e.document);
    });

    vscode.workspace.onDidChangeTextDocument((e) => {
      this.lintDocument(e.document);
    });

    this.lintDocument(vscode.window.activeTextEditor.document); // on start

    context.subscriptions.push(this.collection);
  }

  createDiagnostic(range, labelKey, type) {
    const message = ["No matching key.", "No value for this key."];
    const severity = {
      0: vscode.DiagnosticSeverity.Warning,
      1: vscode.DiagnosticSeverity.Information,
    };

    const diagnostic = new vscode.Diagnostic(
      range,
      `${message[type]} Update the label's key, value, or your configuration settings and try again.`,
      severity[type]
    );

    diagnostic.source = "peacock-labels";
    diagnostic.code = labelKey;

    return diagnostic;
  }

  lintAllDocuments() {
    // find all documents
    // lint
  }

  lintLine(doc, line) {
    const char = line.text.search(labelKeyRegExp.partialkey);

    if (char > -1) {
      const label = getLabelAtPosition(
        doc,
        new vscode.Position(line.lineNumber, char)
      );

      if (label) {
        const type = this.linterType(label.key);

        if (type > -1) {
          return this.createDiagnostic(
            label.range,
            label.key,
            this.linterType(label.key)
          );
        }
      }
    }
  }

  lintDocument(doc) {
    let documentDiagnostics = [];

    if (doc) {
      let line = doc.lineAt(0);

      while (!line._isLastLine) {
        const lineDiagnostic = this.lintLine(doc, line);

        if (lineDiagnostic) {
          documentDiagnostics.push(lineDiagnostic);
        }

        line = doc.lineAt(line.lineNumber + 1);
      }
    }

    this.collection.set(doc.uri, documentDiagnostics);

    return documentDiagnostics;
  }

  linterType(key) {
    const labelManager = new LabelManager();

    if (!labelManager.hasKey(key)) {
      return 0; // no value available
    } else if (!labelManager.getLabel(key)) {
      return 1; // no key available
    }

    return -1;
  }
}

module.exports = {
  LabelLinterProvider,
};
