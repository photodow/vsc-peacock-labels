const { MarkdownString, Hover } = require("vscode");
const { getLabelAtPosition } = require("../utils/getLabelAtPosition");
const { LabelManager } = require("../LabelManager");

class LabelHoverProvider {
  provideHover(doc, position, cancelToken) {
    const labelManager = new LabelManager();
    const label = getLabelAtPosition(doc, position);

    if (!label) {
      // if (!labelManager.hasKey(label.key)) { // uncomment this line to also also return empty if key not available in object
      return;
    }

    const labelValue = labelManager.getLabel(label.key);
    const markdown = new MarkdownString("", true);
    markdown.isTrusted = true;
    markdown.supportHtml = true;

    if (labelValue) {
      markdown.appendMarkdown(`
${formatLabelTemplate(`**${labelValue}**`)}

---
`);
    }

    markdown.appendMarkdown(`<small>${labelManager.statusConfig}</small>`);

    return new Hover(markdown);
  }
}

function formatLabelTemplate(labelValue) {
  return labelValue.replaceAll(/%{([^%]+)}/g, "`$1`");
}

module.exports = {
  LabelHoverProvider,
};
