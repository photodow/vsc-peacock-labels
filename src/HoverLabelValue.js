const { MarkdownString, Hover } = require("vscode");
const { getLabelAtPosition } = require("./getLabelKey");
const { getLabelValue } = require("./getLabels");

// Find all matches in code for codelense
// Format hover text and add context

class HoverLabelValue {
  async provideHover(doc, position, cancelToken) {
    const label = getLabelAtPosition(doc, position);

    if (!label) {
      return;
    }

    const labelValue = await getLabelValue(label.key);

    if (!labelValue) {
      return;
    }

    const markdown = new MarkdownString("", true);
    markdown.isTrusted = true;
    markdown.supportHtml = true;
    markdown.appendMarkdown(`
**Peacock Label**

---

${formatLabelTemplate(`"${labelValue}"`)}
`);

    return new Hover(markdown);
  }
}

function formatLabelTemplate(labelValue) {
  return labelValue.replaceAll(/%{([^%]+)}/g, "*`$1`*");
}

module.exports = {
  HoverLabelValue,
};
