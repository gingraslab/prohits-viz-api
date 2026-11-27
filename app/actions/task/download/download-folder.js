import archive from './archive.js';
import config from '../../../config/config.js';
import exists from '../../../helpers/download/exists.js';
import logger from '../../../helpers/logging/logger.js';
import { isTaskID, notFound } from '../../../helpers/download/valid-names.js';

const downloadFolder = async (req, res) => {
  try {
    const { folder } = req.params;
    if (!isTaskID(folder)) {
      notFound(res);
      return;
    }
    const taskFolder = `${config.workDir}${folder}`;
    await exists(taskFolder, res);
    archive(taskFolder, res);
  } catch (error) {
    logger.error(`download folder - ${error.toString()}`);
    res.status(500);
    res.end();
  }
};

export default downloadFolder;
