const { CompletionItem, CompletionItemKind } = require("vscode");
const { LabelManager } = require("../LabelManager");

class LabelCompletionItemProvider {
  constructor() {
    this.completionItems = [];
    this.getCompletionItems();
  }

  getCompletionItems() {
    new LabelManager().keys.forEach((key) => {
      this.completionItems.push(
        new CompletionItem(key, CompletionItemKind.Text)
      );
    });
  }

  provideCompletionItems(doc, position, cancelToken) {
    return this.completionItems;
  }
}

module.exports = {
  LabelCompletionItemProvider,
};
