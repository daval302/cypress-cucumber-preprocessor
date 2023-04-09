import path from "path";

import { inspect } from "util";

import { generateMessages } from "@cucumber/gherkin";

import { IdGenerator, SourceMediaType } from "@cucumber/messages";

import {
  ICypressConfiguration,
  getTestFiles,
} from "@badeball/cypress-configuration";

import ancestor from "common-ancestor-path";

import { assertAndReturn } from "./helpers/assertions";

import { resolve } from "./preprocessor-configuration";

import {
  getStepDefinitionPaths,
  getStepDefinitionPatterns,
} from "./step-definitions";

import { notNull } from "./helpers/type-guards";

import { ensureIsRelative } from "./helpers/paths";

import { rebuildOriginalConfigObject } from "./add-cucumber-preprocessor-plugin";

import debug from "./helpers/debug";

import type { CreateTestsOptions } from "./create-tests";

const { stringify } = JSON;

export async function compile(
  configuration: ICypressConfiguration,
  data: string,
  uri: string
) {
  configuration = rebuildOriginalConfigObject(configuration);

  const options = {
    includeSource: false,
    includeGherkinDocument: true,
    includePickles: true,
    newId: IdGenerator.uuid(),
  };

  const relativeUri = path.relative(configuration.projectRoot, uri);

  const envelopes = generateMessages(
    data,
    relativeUri,
    SourceMediaType.TEXT_X_CUCUMBER_GHERKIN_PLAIN,
    options
  );

  if (envelopes[0].parseError) {
    throw new Error(
      assertAndReturn(
        envelopes[0].parseError.message,
        "Expected parse error to have a description"
      )
    );
  }

  const gherkinDocument = assertAndReturn(
    envelopes.map((envelope) => envelope.gherkinDocument).find(notNull),
    "Expected to find a gherkin document amongst the envelopes."
  );

  const pickles = envelopes.map((envelope) => envelope.pickle).filter(notNull);

  const implicitIntegrationFolder = assertAndReturn(
    ancestor(
      ...getTestFiles(configuration).map(path.dirname).map(path.normalize)
    ),
    "Expected to find a common ancestor path"
  );

  const preprocessor = await resolve(
    configuration,
    configuration.env,
    implicitIntegrationFolder
  );

  const { stepDefinitions } = preprocessor;

  debug(
    `resolving step definitions using template(s) ${inspect(stepDefinitions)}`
  );

  const stepDefinitionPatterns = getStepDefinitionPatterns(
    {
      cypress: configuration,
      preprocessor,
    },
    uri
  );

  debug(
    `for ${inspect(
      ensureIsRelative(configuration.projectRoot, uri)
    )} yielded patterns ${inspect(
      stepDefinitionPatterns.map((pattern) =>
        ensureIsRelative(configuration.projectRoot, pattern)
      )
    )}`
  );

  const stepDefinitionPaths = await getStepDefinitionPaths(
    stepDefinitionPatterns
  );

  if (stepDefinitionPaths.length === 0) {
    debug("found no step definitions");
  } else {
    debug(
      `found step definitions ${inspect(
        stepDefinitionPaths.map((path) =>
          ensureIsRelative(configuration.projectRoot, path)
        )
      )}`
    );
  }

  const prepareLibPath = (...parts: string[]) =>
    stringify(path.join(__dirname, ...parts));

  const createTestsPath = prepareLibPath("create-tests");

  const registryPath = prepareLibPath("registry");

  const ensureRelativeToProjectRoot = (path: string) =>
    ensureIsRelative(configuration.projectRoot, path);

  const createTestsOptions: CreateTestsOptions = [
    data,
    gherkinDocument,
    pickles,
    preprocessor.messages.enabled,
    preprocessor.omitFiltered,
    {
      stepDefinitions,
      stepDefinitionPatterns: stepDefinitionPatterns.map(
        ensureRelativeToProjectRoot
      ),
      stepDefinitionPaths: stepDefinitionPaths.map(ensureRelativeToProjectRoot),
    },
  ];

  return `
    const { default: createTests } = require(${createTestsPath});
    const { withRegistry } = require(${registryPath});

    const registry = withRegistry(
      false,
      () => {
        ${stepDefinitionPaths
          .map((stepDefintion) => `require(${stringify(stepDefintion)});`)
          .join("\n    ")}
      }
    );

    registry.finalize();

    createTests(registry, ...${stringify(createTestsOptions)});
  `;
}
