const labelKeyRegExp = {
  fullkey: /[-\w]+(\.[-\w]+)+(?=[,'"`])/, // aaa.aaa.aaa
  partialkey: /[-\w]+(\.[-\w]*)*(?=[,'"`])/, // aaa.aaa.
};

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
