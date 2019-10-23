export interface RunSpec {
  readonly inputs: ReadonlyMap<string, unknown>;
  readonly outputPath: string;
}

export function generateRunSpecs(
    validatedInputs: ReadonlyMap<string, unknown>,
    repeatedKeys: ReadonlySet<string>,
    outputPattern: string,
): RunSpec[] {
  const resultList: RunSpec[] = [
    {inputs: new Map(validatedInputs), outputPath: outputPattern},
  ];

  for (const repeatedKey of repeatedKeys) {
    const rootSpecs: RunSpec[] = [...resultList];
    resultList.splice(0, resultList.length);

    for (const spec of rootSpecs) {
      const repeatedValue = spec.inputs.get(repeatedKey);
      if (!(repeatedValue instanceof Array)) {
        throw new Error(`Key ${repeatedKey} is not an array`);
      }

      for (const value of repeatedValue) {
        const newInputs = new Map(spec.inputs);
        newInputs.set(repeatedKey, value);

        const newOutputPath = spec.outputPath.replace(`{${repeatedKey}}`, value);
        resultList.push({inputs: newInputs, outputPath: newOutputPath});
      }
    }
  }

  return resultList;
}
