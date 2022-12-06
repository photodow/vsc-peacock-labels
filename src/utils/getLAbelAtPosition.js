const quotesRegexStr = "'\"`";
const labelKeyRegExp = {
  fullkey: new RegExp(
    labelKeyGen("+", ",", "^") + "|" + labelKeyGen("+", quotesRegexStr),
    "gm"
  ), // aaa.aaa.aaa
  partialkey: new RegExp(
    labelKeyGen("*", ",", "^") + "|" + labelKeyGen("*", quotesRegexStr),
    "gm"
  ), // aaa.aaa.
  ignore:
    /^(has|not|have|be|\d+)\.|\.(har|com|org|net|json|js|ts|json|csv|info|zip|png|gif|jp(e)?g|md|html|css)?$/gm,
};

function labelKeyGen(quant = "", end = "", start = "") {
  return `${start}[${quotesRegexStr}][-\\w]+(\\.[-\\w]${quant})${quant}(?=['${end}])`;
}

function getLabelAtPosition(doc, position) {
  const range = doc.getWordRangeAtPosition(position, labelKeyRegExp.fullkey);

  if (!range) {
    return false;
  }

  const key = doc.getText(range).slice(1);
  const hasFileExtension = key.search(labelKeyRegExp.ignore);

  if (hasFileExtension > -1) {
    return false;
  }

  return {
    range,
    key: key,
  };
}

module.exports = {
  getLabelAtPosition,
  labelKeyRegExp,
};
