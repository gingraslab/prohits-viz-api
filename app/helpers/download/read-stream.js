import fs from 'fs';

import config from '../../config/config.js';
import extToMimeType from './ext-to-mime-type.js';
import logger from '../logging/logger.js';
import removeFile from '../files/remove-file.js';
import { isTaskID } from './valid-names.js';

// Removes the task folder the file came from. Only a work folder directly
// inside tmp/ is ever removed, whatever path the caller passes.
export const removeFileOnCompletion = (file, shouldRemoveFile) => {
  if (!shouldRemoveFile || !file.startsWith(config.workDir)) {
    return;
  }
  const folder = file.slice(config.workDir.length).split('/')[0];
  if (isTaskID(folder)) {
    removeFile(`${config.workDir}${folder}`).catch((error) => {
      logger.error(`remove task folder - ${error.toString()}`);
    });
  }
};

const readStream = (file, res, shouldRemoveFile = false) => (
  new Promise((resolve, reject) => {
    res.setHeader('Content-Type', extToMimeType(file));

    const stream = fs.createReadStream(file);
    stream.pipe(res);
    stream.on('error', () => {
      reject(new Error(`Could not read: ${file}`));
    });
    stream.on('end', () => {
      res.end();
      removeFileOnCompletion(file, shouldRemoveFile);
      resolve();
    });
  })
);

export default readStream;
