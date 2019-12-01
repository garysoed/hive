export function runProcessor(
    processorContent: string,
    resolvedInputs: ReadonlyMap<string, unknown>,
    globals: ReadonlyMap<string, any>,
): unknown {
  const $hive: {[key: string]: unknown} = {};
  for (const [key, value] of resolvedInputs) {
    $hive[key] = value;
  }

  // This is used in eval.
  const $hiveGlobals: {[key: string]: any} = {};
  for (const [key, value] of globals) {
    $hiveGlobals[key] = value;
  }

  // tslint:disable-next-line: no-eval
  return eval(processorContent);
}
