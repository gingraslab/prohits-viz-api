import exists from './task-exists.js';
import logger from '../../../helpers/logging/logger.js';
import status from './task-status.js';
import { isTaskFolder } from '../../../helpers/download/valid-names.js';

/* Get status of specified tasks. First checks
** to make sure task folder exists, then grabs the
** status file. Names that are not task IDs are skipped. */
const updateStatus = async (req, res) => {
  try {
    const { tasks } = req.params;
    const folders = await exists(tasks.split(';').filter(isTaskFolder));
    const taskStatus = await status(folders);
    res.send({ tasks: taskStatus });
  } catch (error) {
    logger.error(`update task status - ${error.toString()}`);
    res.status(500);
    res.end();
  }
};

export default updateStatus;
