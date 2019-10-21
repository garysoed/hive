import { Observable } from '@rxjs';


export function runProcessor(
    processorContent: string,
    resolvedInputs: Map<string, unknown>,
): string {
  const $hive: {[key: string]: unknown} = {};
  for (const [key, value] of resolvedInputs) {
    $hive[key] = value;
  }

  // tslint:disable-next-line: no-eval
  return eval(processorContent);
}
