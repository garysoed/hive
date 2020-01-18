import { Type } from '@gs-types';

type SpecOf<O extends {}> = {[K in keyof O]: Type<O[K]>};


export class ProcessorSpec<O extends {}> {
  constructor(private readonly specs: SpecOf<O>) { }

  checkInputs(inputs: ReadonlyMap<string, unknown>): O {
    const output: Partial<O> = {};
    for (const key in this.specs) {
      if (!this.specs.hasOwnProperty(key)) {
        continue;
      }

      const input = inputs.get(key);
      assert(key, this.specs, input);
      output[key] = input;
    }

    return output as O;
  }

  getInputsMap(): ReadonlyMap<string, Type<unknown>> {
    const map = new Map<string, Type<unknown>>();
    for (const key in this.specs) {
      if (!this.specs.hasOwnProperty(key)) {
        continue;
      }

      map.set(key, this.specs[key]);
    }

    return map;
  }
}

function assert<O extends {}, K extends keyof O>(
    key: K,
    specs: SpecOf<O>,
    input: unknown,
): asserts input is O[K] {
  const spec: Type<O[K]> = specs[key];
  spec.assert(input);
}
