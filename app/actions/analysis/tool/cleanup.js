import fs from 'fs/promises';

import config from '../../../config/config.js';
import deleteDirs from '../../../helpers/files/delete-dir.js';

const cleanup = async (workDir, tool) => {
  if (tool === 'scv') {
    const source = `${process.cwd()}/${config.dataDir}versions.txt`;
    const target = `${workDir}/other/versions.txt`;
    await fs.mkdir(`${workDir}/other`, { recursive: true });
    await fs.copyFile(source, target);
  }

  await deleteDirs(workDir, ['files', 'helper-files']);
};

export default cleanup;
