const labelKeyRegExp = {
  fullkey: new RegExp(
    labelKeyGen("+", ",", "^") + "|" + labelKeyGen("+", "'\"`"),
    "gm"
  ), // aaa.aaa.aaa
  partialkey: new RegExp(
    labelKeyGen("*", ",", "^") + "|" + labelKeyGen("*", "'\"`"),
    "gm"
  ), // aaa.aaa.
};

console.log(labelKeyGen("*", ",", "^") + "|" + labelKeyGen("*", "'\"`"));

function labelKeyGen(quant = "", end = "", start = "") {
  return `${start}[-\\w]+(\\.[-\\w]${quant})${quant}(?=['${end}])`;
}

function getLabelAtPosition(doc, position) {
  const range = doc.getWordRangeAtPosition(position, labelKeyRegExp.fullkey);

  if (!range) {
    return false;
  }

  return {
    range,
    key: doc.getText(range),
  };
}

module.exports = {
  getLabelAtPosition,
  labelKeyRegExp,
};
