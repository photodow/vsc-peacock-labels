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

    // this.lintDocument(vscode.window.activeTextEditor.document); // on start

    context.subscriptions.push(this.collection);

    context.subscriptions.push(
      vscode.commands.registerCommand("peacockLabels.lintAllFiles", () => {
        console.log("register command");
        this.lintAllFiles();
      })
    );
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

  lintLine(doc, line) {
    const char = line.text.search(labelKeyRegExp.partialkey);

    if (char === -1) {
      return false;
    }

    const label = getLabelAtPosition(
      doc,
      new vscode.Position(line.lineNumber, char + 1)
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

  lintDocument(doc) {
    let documentDiagnostics = [];

    if (doc && doc.lineAt && doc.uri && doc.getWordRangeAtPosition) {
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

  async lintAllFiles() {
    const waitForIt = [];
    const files = await vscode.workspace.findFiles(
      "**/*.{ts,js,json,csv}",
      // "peacock-lightning/**/*.{ts,js,json,csv}", // for testing?
      "**/{node_modules,dist,build,adobe-legacy,packages,.vscode}/**"
    );

    for (let i = 0, l = files.length; i < l; i++) {
      const uri = vscode.Uri.file(files[i].path);
      const fileSize = (await vscode.workspace.fs.stat(uri)).size; // bytes
      const fiftyMb = 100000 * 50; // 50mb

      if (fileSize < fiftyMb) {
        const loadingDoc = vscode.workspace.openTextDocument(uri);

        waitForIt.push(loadingDoc);

        loadingDoc.then((doc) => {
          this.lintDocument(doc);
          vscode.window.setStatusBarMessage(
            `peacock-labels (linting ${i} of ${l} files)`
          );
        });
      }
    }
    Promise.all(waitForIt).then(() => {
      vscode.window.setStatusBarMessage(`peacock-labels (linting complete!)`);
    });
  }
}

module.exports = {
  LabelLinterProvider,
};
