import { FileRef } from './file-ref';
import { RuleRef } from './rule-ref';

export type RenderInput = boolean|number|string|object|boolean[]|number[]|string[]|object[]|
    FileRef|RuleRef;
