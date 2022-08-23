import * as express from 'express';
import {source} from 'grapevine';
import {ExpressAppLike} from 'gs-testing/export/fake';

export const $express = source<ExpressAppLike>(() => {
  return express.default();
});
