import { isString } from "./type-guards";

const homepage = "https://github.com/badeball/cypress-cucumber-preprocessor";

export function createError(message: string) {
  return new Error(
    `${message} (this might be a bug, please report at ${homepage})`
  );
}

export function fail(message: string) {
  throw createError(message);
}

export function assert(value: unknown, message: string): asserts value {
  if (value != null) {
    return;
  }

  fail(message);
}

export function assertAndReturn<T>(
  value: T,
  message: string
): Exclude<T, false | null | undefined> {
  assert(value, message);
  return value as Exclude<T, false | null | undefined>;
}

export function assertIsString(
  value: unknown,
  message: string
): asserts value is string {
  assert(isString(value), message);
}
