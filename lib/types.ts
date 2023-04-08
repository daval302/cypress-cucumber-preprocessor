export interface IParameterTypeDefinition<T, C extends Mocha.Context> {
  name: string;
  regexp: RegExp;
  transformer: (this: C, ...match: string[]) => T;
}

export interface IHookBody {
  (this: Mocha.Context): void;
}

export interface IStepDefinitionBody<
  T extends unknown[],
  C extends Mocha.Context
> {
  (this: C, ...args: T): void;
}
