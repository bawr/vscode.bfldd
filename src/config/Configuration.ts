/* #region  Imports */
"use strict";
import * as vscode from "vscode";
import * as config from "./IConfiguration";
import * as defaultConfig from "./DefaultConfiguration";
/* #endregion */

/* #region  ConfigurationService */
export class ConfigurationService {


    public onConfigurationChanged: (() => void) | null = null;
    /**
     *
     */
    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(e => {
                this.raiseConfigurationChanged();
            })
        );
    }

    protected raiseConfigurationChanged() {
        if (this.onConfigurationChanged) {
            this.onConfigurationChanged();
        }
        // foldingRangeProvider.configuration = loadConfiguration();
    }

    public getSupportedLanguages() {
        const supportedLanguages: Set<string> = new Set();
        const configuration = this.loadConfiguration();
        for (let prop in configuration) {
            const match = prop.match(/^\[([^.]+)(\..+)?\]$/);
            if (!match) {
                continue;
            }
            if (configuration[prop].disableFolding) {
                continue;
            }
            supportedLanguages.add(match[1]);
        }
        return Array.from(supportedLanguages);
    }


    public loadConfiguration() {
        let loadedConfig = vscode.workspace
            .getConfiguration()
            .get<config.IConfiguration>("maptz.regionfolder");
        let config: config.IConfiguration = Object.assign(
            {},
            defaultConfig.DefaultConfiguration
        );
        config = Object.assign(config, loadedConfig);
        return config;
    }

    public getConfigurationForDocument(document: vscode.TextDocument, config?: config.IConfiguration): config.ILanguageConfiguration | null {
        if (config === undefined) {
            config = this.loadConfiguration();
        }
        let lookupId = document.languageId;
        if (lookupId === "plaintext") {
            const fileName = document.fileName;
            const extIndex = fileName.search(/[.][^.]{1,8}$/)
            if (extIndex !== -1) {
                // "/path/to/foo.bawr.baz" -> "plaintext.baz"
                lookupId += fileName.substr(extIndex);
            }
        }
        lookupId = `[${lookupId}]`;
        const currentLanguageConfig = config[lookupId];
        if ((typeof currentLanguageConfig === "undefined") || !currentLanguageConfig) {
            return null;
        }
        return currentLanguageConfig;
    }
}
/* #endregion */



