import ErrorStackParser from "error-stack-parser";
import { assertAndReturn } from "./assertions";

export interface Position {
  line: number;
  column: number;
  source: string;
}

export function retrievePositionFromSourceMap(): Position {
  const stack = ErrorStackParser.parse(new Error());

  const relevantFrame = stack[4];

  return {
    line: assertAndReturn(
      relevantFrame.getLineNumber(),
      "Expected to find a line number"
    ),
    column: assertAndReturn(
      relevantFrame.getColumnNumber(),
      "Expected to find a column number"
    ),
    source: assertAndReturn(
      relevantFrame.fileName,
      "Expected to find a filename"
    ),
  };
}

export function maybeRetrievePositionFromSourceMap(
  experimentalSourceMap: boolean
): Position | undefined {
  if (experimentalSourceMap) {
    return retrievePositionFromSourceMap();
  }
}
