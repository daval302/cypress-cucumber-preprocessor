import { ICypressConfiguration } from "@badeball/cypress-configuration";

import { cosmiconfig } from "cosmiconfig";

import util from "util";

import debug from "./helpers/debug";

import { ensureIsRelative } from "./helpers/paths";

import {
  isString,
  isStringOrStringArray,
  isBoolean,
} from "./helpers/type-guards";

function hasOwnProperty<X extends Record<string, unknown>, Y extends string>(
  value: X,
  property: Y
): value is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(value, property);
}

function validateConfigurationEntry(
  key: string,
  value: Record<string, unknown>
): Partial<IPreprocessorConfiguration> {
  switch (key) {
    case "stepDefinitions":
      if (!isStringOrStringArray(value)) {
        throw new Error(
          `Expected a string or array of strings (stepDefinitions), but got ${util.inspect(
            value
          )}`
        );
      }
      return { [key]: value };
    case "messages": {
      if (typeof value !== "object" || value == null) {
        throw new Error(
          `Expected an object (messages), but got ${util.inspect(value)}`
        );
      }
      if (
        !hasOwnProperty(value, "enabled") ||
        typeof value.enabled !== "boolean"
      ) {
        throw new Error(
          `Expected a boolean (messages.enabled), but got ${util.inspect(
            value
          )}`
        );
      }
      let output: string | undefined;
      if (hasOwnProperty(value, "output")) {
        if (isString(value.output)) {
          output = value.output;
        } else {
          throw new Error(
            `Expected a string (messages.output), but got ${util.inspect(
              value
            )}`
          );
        }
      }
      const messagesConfig = {
        enabled: value.enabled,
        output,
      };
      return { [key]: messagesConfig };
    }
    case "json": {
      if (typeof value !== "object" || value == null) {
        throw new Error(
          `Expected an object (json), but got ${util.inspect(value)}`
        );
      }
      if (
        !hasOwnProperty(value, "enabled") ||
        typeof value.enabled !== "boolean"
      ) {
        throw new Error(
          `Expected a boolean (json.enabled), but got ${util.inspect(value)}`
        );
      }
      let output: string | undefined;
      if (hasOwnProperty(value, "output")) {
        if (isString(value.output)) {
          output = value.output;
        } else {
          throw new Error(
            `Expected a string (json.output), but got ${util.inspect(value)}`
          );
        }
      }
      const messagesConfig = {
        enabled: value.enabled,
        output,
      };
      return { [key]: messagesConfig };
    }
    case "html": {
      if (typeof value !== "object" || value == null) {
        throw new Error(
          `Expected an object (json), but got ${util.inspect(value)}`
        );
      }
      if (
        !hasOwnProperty(value, "enabled") ||
        typeof value.enabled !== "boolean"
      ) {
        throw new Error(
          `Expected a boolean (html.enabled), but got ${util.inspect(value)}`
        );
      }
      let output: string | undefined;
      if (hasOwnProperty(value, "output")) {
        if (isString(value.output)) {
          output = value.output;
        } else {
          throw new Error(
            `Expected a string (html.output), but got ${util.inspect(value)}`
          );
        }
      }
      const messagesConfig = {
        enabled: value.enabled,
        output,
      };
      return { [key]: messagesConfig };
    }
    case "filterSpecs": {
      if (!isBoolean(value)) {
        throw new Error(
          `Expected a boolean (filterSpecs), but got ${util.inspect(value)}`
        );
      }
      return { [key]: value };
    }
    case "omitFiltered": {
      if (!isBoolean(value)) {
        throw new Error(
          `Expected a boolean (omitFiltered), but got ${util.inspect(value)}`
        );
      }
      return { [key]: value };
    }
    default:
      return {};
  }
}

function validateEnvironmentOverrides(
  environment: Record<string, unknown>
): IEnvironmentOverrides {
  const overrides: IEnvironmentOverrides = {};

  if (hasOwnProperty(environment, "stepDefinitions")) {
    const { stepDefinitions } = environment;

    if (isStringOrStringArray(stepDefinitions)) {
      overrides.stepDefinitions = stepDefinitions;
    } else {
      throw new Error(
        `Expected a string or array of strings (stepDefinitions), but got ${util.inspect(
          stepDefinitions
        )}`
      );
    }
  }

  if (hasOwnProperty(environment, "messagesEnabled")) {
    const { messagesEnabled } = environment;

    if (isBoolean(messagesEnabled)) {
      overrides.messagesEnabled = messagesEnabled;
    } else if (isString(messagesEnabled)) {
      overrides.messagesEnabled = stringToMaybeBoolean(messagesEnabled);
    } else {
      throw new Error(
        `Expected a boolean (messagesEnabled), but got ${util.inspect(
          messagesEnabled
        )}`
      );
    }
  }

  if (hasOwnProperty(environment, "messagesOutput")) {
    const { messagesOutput } = environment;

    if (isString(messagesOutput)) {
      overrides.messagesOutput = messagesOutput;
    } else {
      throw new Error(
        `Expected a string (messagesOutput), but got ${util.inspect(
          messagesOutput
        )}`
      );
    }
  }

  if (hasOwnProperty(environment, "jsonEnabled")) {
    const { jsonEnabled } = environment;

    if (isBoolean(jsonEnabled)) {
      overrides.jsonEnabled = jsonEnabled;
    } else if (isString(jsonEnabled)) {
      overrides.jsonEnabled = stringToMaybeBoolean(jsonEnabled);
    } else {
      throw new Error(
        `Expected a boolean (jsonEnabled), but got ${util.inspect(jsonEnabled)}`
      );
    }
  }

  if (hasOwnProperty(environment, "jsonOutput")) {
    const { jsonOutput } = environment;

    if (isString(jsonOutput)) {
      overrides.jsonOutput = jsonOutput;
    } else {
      throw new Error(
        `Expected a string (jsonOutput), but got ${util.inspect(jsonOutput)}`
      );
    }
  }

  if (hasOwnProperty(environment, "htmlEnabled")) {
    const { htmlEnabled } = environment;

    if (isBoolean(htmlEnabled)) {
      overrides.htmlEnabled = htmlEnabled;
    } else if (isString(htmlEnabled)) {
      overrides.htmlEnabled = stringToMaybeBoolean(htmlEnabled);
    } else {
      throw new Error(
        `Expected a boolean (htmlEnabled), but got ${util.inspect(htmlEnabled)}`
      );
    }
  }

  if (hasOwnProperty(environment, "htmlOutput")) {
    const { htmlOutput } = environment;

    if (isString(htmlOutput)) {
      overrides.htmlOutput = htmlOutput;
    } else {
      throw new Error(
        `Expected a string (htmlOutput), but got ${util.inspect(htmlOutput)}`
      );
    }
  }

  if (hasOwnProperty(environment, "filterSpecs")) {
    const { filterSpecs } = environment;

    if (isBoolean(filterSpecs)) {
      overrides.filterSpecs = filterSpecs;
    } else if (isString(filterSpecs)) {
      overrides.filterSpecs = stringToMaybeBoolean(filterSpecs);
    } else {
      throw new Error(
        `Expected a boolean (filterSpecs), but got ${util.inspect(filterSpecs)}`
      );
    }
  }

  if (hasOwnProperty(environment, "omitFiltered")) {
    const { omitFiltered } = environment;

    if (isBoolean(omitFiltered)) {
      overrides.omitFiltered = omitFiltered;
    } else if (isString(omitFiltered)) {
      overrides.omitFiltered = stringToMaybeBoolean(omitFiltered);
    } else {
      throw new Error(
        `Expected a boolean (omitFiltered), but got ${util.inspect(
          omitFiltered
        )}`
      );
    }
  }

  return overrides;
}

export function stringToMaybeBoolean(value: string): boolean | undefined {
  if (value === "") {
    return;
  }

  const falsyValues = ["0", "false"];

  if (falsyValues.includes(value)) {
    return false;
  } else {
    return true;
  }
}

export interface IPreprocessorConfiguration {
  readonly stepDefinitions: string | string[];
  readonly messages?: {
    enabled: boolean;
    output?: string;
  };
  readonly json?: {
    enabled: boolean;
    output?: string;
  };
  readonly html?: {
    enabled: boolean;
    output?: string;
  };
  readonly filterSpecs?: boolean;
  readonly omitFiltered?: boolean;
  readonly implicitIntegrationFolder: string;
}

export interface IEnvironmentOverrides {
  stepDefinitions?: string | string[];
  messagesEnabled?: boolean;
  messagesOutput?: string;
  jsonEnabled?: boolean;
  jsonOutput?: string;
  htmlEnabled?: boolean;
  htmlOutput?: string;
  filterSpecs?: boolean;
  omitFiltered?: boolean;
}

export const DEFAULT_STEP_DEFINITIONS = [
  "[integration-directory]/[filepath]/**/*.{js,mjs,ts,tsx}",
  "[integration-directory]/[filepath].{js,mjs,ts,tsx}",
  "cypress/support/step_definitions/**/*.{js,mjs,ts,tsx}",
];

export class PreprocessorConfiguration implements IPreprocessorConfiguration {
  constructor(
    private explicitValues: Partial<IPreprocessorConfiguration>,
    private environmentOverrides: IEnvironmentOverrides,
    private cypressConfiguration: ICypressConfiguration,
    public implicitIntegrationFolder: string
  ) {}

  get stepDefinitions() {
    const explicit =
      this.environmentOverrides.stepDefinitions ??
      this.explicitValues.stepDefinitions;

    if (explicit) {
      return explicit;
    }

    const config = this.cypressConfiguration;

    return DEFAULT_STEP_DEFINITIONS.map((pattern) =>
      pattern.replace(
        "[integration-directory]",
        ensureIsRelative(
          config.projectRoot,
          "integrationFolder" in config
            ? config.integrationFolder
            : this.implicitIntegrationFolder
        )
      )
    );
  }

  get messages() {
    return {
      enabled:
        this.json.enabled ||
        this.html.enabled ||
        (this.environmentOverrides.messagesEnabled ??
          this.explicitValues.messages?.enabled ??
          false),
      output:
        this.environmentOverrides.messagesOutput ??
        this.explicitValues.messages?.output ??
        "cucumber-messages.ndjson",
    };
  }

  get json() {
    return {
      enabled:
        this.environmentOverrides.jsonEnabled ??
        this.explicitValues.json?.enabled ??
        false,
      output:
        this.environmentOverrides.jsonOutput ??
        (this.explicitValues.json?.output || "cucumber-report.json"),
    };
  }

  get html() {
    return {
      enabled:
        this.environmentOverrides.htmlEnabled ??
        this.explicitValues.html?.enabled ??
        false,
      output:
        this.environmentOverrides.htmlOutput ??
        this.explicitValues.html?.output ??
        "cucumber-report.html",
    };
  }

  get filterSpecs() {
    return (
      this.environmentOverrides.filterSpecs ??
      this.explicitValues.filterSpecs ??
      false
    );
  }

  get omitFiltered() {
    return (
      this.environmentOverrides.omitFiltered ??
      this.explicitValues.omitFiltered ??
      false
    );
  }
}

async function cosmiconfigResolver(projectRoot: string) {
  const result = await cosmiconfig("cypress-cucumber-preprocessor").search(
    projectRoot
  );

  return result?.config;
}

export type ConfigurationFileResolver = (
  projectRoot: string
) => unknown | Promise<unknown>;

export async function resolve(
  cypressConfig: ICypressConfiguration,
  environment: Record<string, unknown>,
  implicitIntegrationFolder: string,
  configurationFileResolver: ConfigurationFileResolver = cosmiconfigResolver
) {
  const result = await configurationFileResolver(cypressConfig.projectRoot);

  const environmentOverrides = validateEnvironmentOverrides(environment);

  if (result) {
    if (typeof result !== "object" || result == null) {
      throw new Error(
        `Malformed configuration, expected an object, but got ${util.inspect(
          result
        )}`
      );
    }

    const config: Partial<IPreprocessorConfiguration> = Object.assign(
      {},
      ...Object.entries(result).map((entry) =>
        validateConfigurationEntry(...entry)
      )
    );

    debug(`resolved configuration ${util.inspect(config)}`);

    return new PreprocessorConfiguration(
      config,
      environmentOverrides,
      cypressConfig,
      implicitIntegrationFolder
    );
  } else {
    debug("resolved no configuration");

    return new PreprocessorConfiguration(
      {},
      environmentOverrides,
      cypressConfig,
      implicitIntegrationFolder
    );
  }
}
