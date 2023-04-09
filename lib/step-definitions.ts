import path from "path";

import * as glob from "glob";

import util from "util";

import assert from "assert";

import isPathInside from "is-path-inside";

import {
  ICypressConfiguration,
  ICypressPost10Configuration,
  ICypressPre10Configuration,
} from "@badeball/cypress-configuration";

import debug from "./helpers/debug";

import { IPreprocessorConfiguration } from "./preprocessor-configuration";

import { ensureIsAbsolute } from "./helpers/paths";

export async function getStepDefinitionPaths(
  stepDefinitionPatterns: string[]
): Promise<string[]> {
  return (
    await Promise.all(
      stepDefinitionPatterns.map((pattern) =>
        glob.glob(pattern, { nodir: true, windowsPathsNoEscape: true })
      )
    )
  ).reduce((acum, el) => acum.concat(el), []);
}

function trimFeatureExtension(filepath: string) {
  return filepath.replace(/\.feature$/, "");
}

export function pathParts(relativePath: string): string[] {
  assert(
    !path.isAbsolute(relativePath),
    `Expected a relative path but got ${relativePath}`
  );

  const parts: string[] = [];

  do {
    parts.push(relativePath);
  } while (
    (relativePath = path.normalize(path.join(relativePath, ".."))) !== "."
  );

  return parts;
}

export function getStepDefinitionPatterns(
  configuration: {
    cypress: ICypressConfiguration;
    preprocessor: IPreprocessorConfiguration;
  },
  filepath: string
): string[] {
  const { cypress, preprocessor } = configuration;

  if ("specPattern" in cypress) {
    return getStepDefinitionPatternsPost10({ cypress, preprocessor }, filepath);
  } else {
    return getStepDefinitionPatternsPre10({ cypress, preprocessor }, filepath);
  }
}

export function getStepDefinitionPatternsPost10(
  configuration: {
    cypress: Pick<ICypressPost10Configuration, "projectRoot">;
    preprocessor: IPreprocessorConfiguration;
  },
  filepath: string
): string[] {
  const projectRoot = configuration.cypress.projectRoot;

  if (!isPathInside(filepath, projectRoot)) {
    throw new Error(`${filepath} is not inside ${projectRoot}`);
  }

  const filepathReplacement = glob.escape(
    trimFeatureExtension(
      path.relative(
        configuration.preprocessor.implicitIntegrationFolder,
        filepath
      )
    ),
    { windowsPathsNoEscape: true }
  );

  debug(`replacing [filepath] with ${util.inspect(filepathReplacement)}`);

  const parts = pathParts(filepathReplacement);

  debug(`replacing [filepart] with ${util.inspect(parts)}`);

  const stepDefinitions = [configuration.preprocessor.stepDefinitions].flat();

  return stepDefinitions
    .flatMap((pattern) => {
      if (pattern.includes("[filepath]") && pattern.includes("[filepart]")) {
        throw new Error(
          `Pattern cannot contain both [filepath] and [filepart], but got ${util.inspect(
            pattern
          )}`
        );
      } else if (pattern.includes("[filepath]")) {
        return pattern.replace("[filepath]", filepathReplacement);
      } else if (pattern.includes("[filepart]")) {
        return [
          ...parts.map((part) => pattern.replace("[filepart]", part)),
          path.normalize(pattern.replace("[filepart]", ".")),
        ];
      } else {
        return pattern;
      }
    })
    .map((pattern) => ensureIsAbsolute(projectRoot, pattern));
}

export function getStepDefinitionPatternsPre10(
  configuration: {
    cypress: Pick<
      ICypressPre10Configuration,
      "projectRoot" | "integrationFolder"
    >;
    preprocessor: IPreprocessorConfiguration;
  },
  filepath: string
): string[] {
  const fullIntegrationFolder = ensureIsAbsolute(
    configuration.cypress.projectRoot,
    configuration.cypress.integrationFolder
  );

  if (!isPathInside(filepath, fullIntegrationFolder)) {
    throw new Error(`${filepath} is not inside ${fullIntegrationFolder}`);
  }

  const filepathReplacement = glob.escape(
    trimFeatureExtension(path.relative(fullIntegrationFolder, filepath)),
    { windowsPathsNoEscape: true }
  );

  debug(`replacing [filepath] with ${util.inspect(filepathReplacement)}`);

  const parts = pathParts(filepathReplacement);

  debug(`replacing [filepart] with ${util.inspect(parts)}`);

  const stepDefinitions = [configuration.preprocessor.stepDefinitions].flat();

  return stepDefinitions
    .flatMap((pattern) => {
      if (pattern.includes("[filepath]") && pattern.includes("[filepart]")) {
        throw new Error(
          `Pattern cannot contain both [filepath] and [filepart], but got ${util.inspect(
            pattern
          )}`
        );
      } else if (pattern.includes("[filepath]")) {
        return pattern.replace("[filepath]", filepathReplacement);
      } else if (pattern.includes("[filepart]")) {
        return [
          ...parts.map((part) => pattern.replace("[filepart]", part)),
          path.normalize(pattern.replace("[filepart]", ".")),
        ];
      } else {
        return pattern;
      }
    })
    .map((pattern) =>
      ensureIsAbsolute(configuration.cypress.projectRoot, pattern)
    );
}
