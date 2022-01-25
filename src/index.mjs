#!/usr/bin/env node

import fsPromises from 'fs/promises';
import { Command } from 'commander';
import { makeModal, makePage } from './maker.mjs';
import Api from './api.mjs';

const program = new Command();

program.option('-a, --api <apiName>', 'strapi api name', null);
program.option('-r, --root <strapi root path>', 'strapi root path', null);
program.option('-s, --schema <schema path>', 'strapi schema path', null);
program.option('-p, --page <page folder>', 'admin page output folder', 'src/pages');
program.option('-m, --modal <modal folder>', 'admin modal output folder', 'src/modals');

program.parse();

const strapiPath = program.opts().root;
const schemaPath = program.opts().schema;
const pagesFolder = program.opts().page;
const modalFolder = program.opts().modal;
const apiName = program.opts().api;

(async () => {
  let data = null;
  if (schemaPath) {
    // 讀取schema
    data = await fsPromises.readFile(schemaPath);
  } else if (strapiPath) {
    // 讀取strapi
    if (!apiName) {
      console.error('Please specify api name');
      return;
    }
    data = await fsPromises.readFile(
      `${strapiPath}/src/api/${apiName}/content-types/${apiName}/schema.json`,
    );
  } else {
    console.error('Please specify strapi path or schema path');
    return;
  }

  const api = new Api(JSON.parse(data.toString()));

  await makePage(api, pagesFolder);
  await makeModal(api, modalFolder);
})();
