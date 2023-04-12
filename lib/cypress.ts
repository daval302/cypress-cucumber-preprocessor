import { CypressCucumberError } from "./error";

const ensureChain = (value: unknown): Cypress.Chainable<unknown> =>
  Cypress.isCy(value) ? value : cy.wrap(value, { log: false });

// eslint-disable-next-line @typescript-eslint/no-empty-function
const nativePromiseConstructor = (async () => {})().constructor;

export function runStepWithLogGroup(options: {
  fn: () => unknown;
  keyword: string;
  text?: string;
}) {
  Cypress.log({
    name: options.keyword,
    message: options.text == null ? "" : `**${options.text}**`,
    groupStart: true,
  } as object);

  const ret = options.fn();

  if (ret instanceof nativePromiseConstructor) {
    throw new CypressCucumberError(
      "Cucumber preprocessor detected that you returned a native promise from a function handler, this is not supported. Using async / await is generally speaking not supported when using Cypress, period, preprocessor or not."
    );
  }

  return ensureChain(ret).then((result) => {
    Cypress.log({ groupEnd: true, emitOnly: true } as object);
    return result;
  });
}
