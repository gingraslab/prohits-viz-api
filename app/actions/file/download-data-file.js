import config from '../../config/config.js';
import exists from '../../helpers/download/exists.js';
import logger from '../../helpers/logging/logger.js';
import readStream from '../../helpers/download/read-stream.js';
import { isFileName, notFound } from '../../helpers/download/valid-names.js';

const downloadDataFile = async (req, res) => {
  try {
    const { file } = req.params;
    if (!isFileName(file)) {
      notFound(res);
      return;
    }
    const completeFilePath = `${config.dataDir}${file}`;
    await exists(completeFilePath, res);
    readStream(completeFilePath, res);
  } catch (error) {
    logger.error(`download data file - ${error.toString()}`);
    res.status(500);
    res.end();
  }
};

export default downloadDataFile;
