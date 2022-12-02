const vscode = require("vscode");
const { default: axios } = require("axios");

const labelState = {
  lastUpdate: new Date(),
  init: false,
  labels: {},
  labelsReversed: {}, // value as the key
  labelKeys: [],
  labelConfig: {},
};

class LabelManager {
  constructor() {
    const waitToRefresh = 1000 * 60 * 60 * 12;
    if (
      labelState.init &&
      new Date().valueOf() - waitToRefresh > labelState.lastUpdate.valueOf()
    ) {
      this.loadLabels();
    }
  }

  async init() {
    if (!labelState.init) {
      await this.loadLabels();

      vscode.workspace.onDidChangeConfiguration(() => {
        vscode.window.setStatusBarMessage(
          `Refreshing labels (${this.statusConfig})`
        );

        this.loadLabels();
      });

      labelState.init = true;
    }
  }

  get labelConfig() {
    return labelState.labelConfig;
  }

  get labels() {
    return labelState.labels;
  }

  get keys() {
    return labelState.labelKeys;
  }

  get labelsReversed() {
    return labelState.labelsReversed;
  }

  setlabelConfig() {
    const { provider, device, platform, environment, language, territory } =
      vscode.workspace.getConfiguration("peacockLabels");

    labelState.labelConfig = {
      provider,
      device,
      platform,
      environment,
      language,
      territory,
    };
  }

  setLabelState({ data }) {
    if (data) {
      labelState.lastUpdate = new Date();
      labelState.labels = data;
      labelState.labelKeys = Object.keys(data).sort();
      labelState.labelsReversed = this.reverseKeyValue(
        labelState.labelKeys,
        labelState.labels
      );

      this.setlabelConfig();
    } else {
      vscode.window.showErrorMessage(
        "Sorry! We ran into a problem loading the labels."
      );
    }

    vscode.window.setStatusBarMessage(`peacock-labels (${this.statusConfig})`);
  }

  get statusConfig() {
    const { provider, device, platform, environment, language, territory } =
      vscode.workspace.getConfiguration("peacockLabels");
    return `${provider} ${environment} ${language}-${territory} ${platform} ${device}`.toLowerCase();
  }

  get labelHeaders() {
    const config = vscode.workspace.getConfiguration("peacockLabels");
    let provider = config.provider.toUpperCase();
    let language = `${config.language}-${config.territory}`;

    if (provider === "PEACOCK") {
      provider = "NBCUOTT";
      language = config.language;
    }

    return {
      "X-SkyOTT-Device": config.device || "TV",
      "X-SkyOTT-Language": language || "en",
      "X-SkyOTT-Platform": config.platform || "ANDROIDTV",
      "X-SkyOTT-Proposition": provider || "NBCUOTT",
      "X-SkyOTT-Provider": provider || "NBCUOTT",
      "X-SkyOTT-Territory": config.territory || "US",
      "X-SkyOTT-ActiveTerritory": config.territory || "US",
    };
  }

  loadLabels() {
    vscode.window.setStatusBarMessage(`Loading labels (${this.statusConfig})`);

    return axios
      .get(this.labelURL, { headers: this.labelHeaders })
      .then((d) => {
        this.setLabelState(d);
      })
      .catch((e) => {
        vscode.window.setStatusBarMessage(
          `peacock-labels (${this.statusConfig}) [error loading]`
        );
        vscode.window.showErrorMessage(
          e.message + ". Check your configurations in settings and try again."
        );
      });
  }

  reverseKeyValue(keys, labels) {
    const labelsReversed = {};

    keys.forEach((key) => {
      if (labels[key]) {
        labelsReversed[labels[key]] = key;
      }
    });

    return labelsReversed;
  }

  get labelURL() {
    const { environment, provider } =
      vscode.workspace.getConfiguration("peacockLabels");
    const env = environment !== "production" ? environment + "." : "";
    const hostname = provider === "Peacock" ? provider + "tv" : provider;

    return `https://atom.${env}${hostname.toLowerCase()}.com/adapter-calypso/v3/labels`;
  }

  hasKey(key) {
    return key in this.labels;
  }

  getLabel(key) {
    const label = this.labels[key];

    if (!label) {
      // vscode.window.showWarningMessage(
      //   "Sorry, we weren't able to find a matching label. Update the label key or value, and try again."
      // );
      return;
    }

    return label;
  }
}

module.exports = {
  LabelManager,
};
