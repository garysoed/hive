export function runProcessor(
    processorContent: string,
    resolvedInputs: ReadonlyMap<string, unknown>,
): unknown {
  const $hive: {[key: string]: unknown} = {};
  for (const [key, value] of resolvedInputs) {
    $hive[key] = value;
  }

  // tslint:disable-next-line: no-eval
  return eval(processorContent);
}
