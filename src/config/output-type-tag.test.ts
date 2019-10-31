import * as yaml from 'yaml';

import { assert, objectThat, should, test } from '@gs-testing';

import { ConstType } from '../core/type/const-type';
import { MediaTypeType } from '../core/type/media-type-type';
import { OutputType } from '../core/type/output-type';

import { OUTPUT_TYPE_TAG } from './output-type-tag';


test('@hive/config/output-type-tag', () => {
  test('resolve', () => {
    should(`parse non arrays correctly`, () => {
      assert(yaml.parse('!!hive/o_type number', {tags: [OUTPUT_TYPE_TAG]})).to
          .equal(objectThat<OutputType>().haveProperties({
            baseType: ConstType.NUMBER,
            isArray: false,
          }));
    });

    should(`parse arrays correctly`, () => {
      assert(yaml.parse('!!hive/o_type number[]', {tags: [OUTPUT_TYPE_TAG]})).to
          .equal(objectThat<OutputType>().haveProperties({
            baseType: ConstType.NUMBER,
            isArray: true,
          }));
    });

    should(`throw error if not an array and base type is invalid`, () => {
      assert(() => yaml.parse('!!hive/o_type invalid', {tags: [OUTPUT_TYPE_TAG]})).to
          .throwErrorWithMessage(/Invalid output type/);
    });

    should(`throw error if array but base type is invalid`, () => {
      assert(() => yaml.parse('!!hive/o_type invalid[]', {tags: [OUTPUT_TYPE_TAG]})).to
          .throwErrorWithMessage(/Invalid output type/);
    });

    should(`throw error if there are no values`, () => {
      assert(() => yaml.parse('!!hive/o_type', {tags: [OUTPUT_TYPE_TAG]})).to
          .throwErrorWithMessage(/Invalid output type/);
    });

    should(`handle trailing whitespaces`, () => {
      assert(yaml.parse('!!hive/o_type number\n    ', {tags: [OUTPUT_TYPE_TAG]})).to
          .equal(objectThat<OutputType>().haveProperties({
            baseType: ConstType.NUMBER,
            isArray: false,
          }));
    });
  });

  test('stringify', () => {
    should(`stringify non arrays correctly`, () => {
      const outputType = {baseType: ConstType.NUMBER, isArray: false};

      assert(yaml.stringify(outputType, {tags: [OUTPUT_TYPE_TAG]}))
          .to.match(/^!!hive\/o_type number/);
    });

    should(`stringify arrays correctly`, () => {
      const outputType = {baseType: ConstType.NUMBER, isArray: true};

      assert(yaml.stringify(outputType, {tags: [OUTPUT_TYPE_TAG]}))
          .to.match(/^!!hive\/o_type number\[\]/);
    });
  });

  test('getBaseType', () => {
    should(`handle media types correctly`, () => {
      assert(yaml.parse('!!hive/o_type media-type/media-subtype', {tags: [OUTPUT_TYPE_TAG]})).to
          .equal(objectThat<OutputType>().haveProperties({
            baseType: objectThat<MediaTypeType>().haveProperties({
              type: 'media-type',
              subtype: 'media-subtype',
            }),
            isArray: false,
          }));
    });

    should(`handle object types correctly`, () => {
      assert(yaml.parse('!!hive/o_type object', {tags: [OUTPUT_TYPE_TAG]})).to
          .equal(objectThat<OutputType>().haveProperties({
            baseType: ConstType.OBJECT,
            isArray: false,
          }));
    });

    should(`handle function types correctly`, () => {
      assert(yaml.parse('!!hive/o_type function', {tags: [OUTPUT_TYPE_TAG]})).to
          .equal(objectThat<OutputType>().haveProperties({
            baseType: ConstType.FUNCTION,
            isArray: false,
          }));
    });

    should(`handle string types correctly`, () => {
      assert(yaml.parse('!!hive/o_type string', {tags: [OUTPUT_TYPE_TAG]})).to
          .equal(objectThat<OutputType>().haveProperties({
            baseType: ConstType.STRING,
            isArray: false,
          }));
    });

    should(`throw error if media type is missing the subtype`, () => {
      assert(() => yaml.parse('!!hive/o_type media-type/', {tags: [OUTPUT_TYPE_TAG]})).to
          .throwErrorWithMessage(/Invalid output type/);
    });

    should(`throw error if media type is missing the type`, () => {
      assert(() => yaml.parse('!!hive/o_type /media-subtype', {tags: [OUTPUT_TYPE_TAG]})).to
          .throwErrorWithMessage(/Invalid output type/);
    });

    should(`throw error if media type has no slash`, () => {
      assert(() => yaml.parse('!!hive/o_type media-type', {tags: [OUTPUT_TYPE_TAG]})).to
          .throwErrorWithMessage(/Invalid output type/);
    });
  });

  test('stringifyBaseType', () => {
    should(`handle object type correctly`, () => {
      const outputType = {baseType: ConstType.OBJECT, isArray: false};

      assert(yaml.stringify(outputType, {tags: [OUTPUT_TYPE_TAG]}))
          .to.match(/^!!hive\/o_type object/);
    });

    should(`handle function type correctly`, () => {
      const outputType = {baseType: ConstType.FUNCTION, isArray: false};

      assert(yaml.stringify(outputType, {tags: [OUTPUT_TYPE_TAG]}))
          .to.match(/^!!hive\/o_type function/);
    });

    should(`handle string type correctly`, () => {
      const outputType = {baseType: ConstType.STRING, isArray: false};

      assert(yaml.stringify(outputType, {tags: [OUTPUT_TYPE_TAG]}))
          .to.match(/^!!hive\/o_type string/);
    });

    should(`handle media type correctly`, () => {
      const mediaTypeType = new MediaTypeType('media-type', 'media-subtype');
      assert(yaml.stringify({baseType: mediaTypeType, isArray: false}, {tags: [OUTPUT_TYPE_TAG]}))
          .to.match(/^!!hive\/o_type media-type\/media-subtype/);
    });
  });
});
