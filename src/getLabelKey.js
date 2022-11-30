function getLabelAtPosition(doc, position) {
  const range = doc.getWordRangeAtPosition(
    position,
    /['"`]\w+(\.\w+)+(?=['"`])/g // aaa.aaa.aaa
  );

  if (!range) {
    return false;
  }

  return {
    range,
    key: doc.getText(range).slice(1),
  };
}

module.exports = {
  getLabelAtPosition,
};
