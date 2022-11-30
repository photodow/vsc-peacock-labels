const vscode = require("vscode");
const { default: axios } = require("axios");

function getLabels() {
  const config = vscode.workspace.getConfiguration("peacockLabels");
  let provider = config.provider;
  let language = config.language;

  switch (config.provider) {
    case "Peacock":
      provider = "NBCUOTT";
      break;
    default:
      provider = provider.toUpperCase();
      language = `${config.language}-${config.territory}`;
  }

  return axios
    .get(getLabelURL(config), {
      headers: {
        "X-SkyOTT-Device": config.device || "TV",
        "X-SkyOTT-Language": language || "en",
        "X-SkyOTT-Platform": config.platform || "ANDROIDTV",
        "X-SkyOTT-Proposition": provider || "NBCUOTT",
        "X-SkyOTT-Provider": provider || "NBCUOTT",
        "X-SkyOTT-Territory": config.territory || "US",
        "X-SkyOTT-ActiveTerritory": config.territory || "US",
      },
    })
    .catch((e) => {
      vscode.window.showErrorMessage(
        e.message + ". Check your configurations in settings and try again."
      );
    });
}

function getLabelURL({ environment, provider }) {
  const env = environment !== "production" ? environment + "." : "";
  const hostname = provider === "Peacock" ? provider + "tv" : provider;

  return `https://atom.${env}${hostname.toLowerCase()}.com/adapter-calypso/v3/labels`;
}

async function getLabelValue(key) {
  const labels = await getLabels();

  const label = labels.data[key];

  if (!label) {
    vscode.window.showWarningMessage(
      "Sorry, we weren't able to find a matching label. Update the label key or value, and try again."
    );
    return;
  }

  return label;
}

module.exports = {
  getLabels,
  getLabelValue,
};
