// Download routes take folder and file names from the URL. Only names shaped
// like the ones the API creates are accepted, so a request can never point
// outside tmp/, archive/ or files/ (no "..", no "/", no absolute paths).

// Work folders in tmp/: nanoid(14) from helpers/files/create-work-dir.js, and
// 10 letters or digits from the Prohits LIMS page link_prohits.php.
const taskIDPattern = /^([A-Za-z0-9_-]{14}|[A-Za-z0-9]{10})$/;
// Folders in tmp/ that are not tasks (config.js ignoreFolders).
const reservedFolders = ['samplefile', 'test', 'uploads'];
// Saved sessions in archive/, from actions/archive/create-id.js (date + nanoid(8)).
const archiveIDPattern = /^[0-9]{6,8}[A-Za-z0-9_-]{8}$/;
const namePattern = /^[A-Za-z0-9_-]{1,100}$/;
const fileNamePattern = /^[A-Za-z0-9_-]{1,100}\.[A-Za-z0-9]{1,10}$/;

const matches = (pattern, value) => typeof value === 'string' && pattern.test(value);

export const isTaskID = value => (
  matches(taskIDPattern, value) && !reservedFolders.includes(value)
);

// Folders whose files can be read: task folders and the sample files.
export const isTaskFolder = value => value === 'samplefile' || isTaskID(value);

export const isArchiveID = value => matches(archiveIDPattern, value);

export const isName = value => matches(namePattern, value);

export const isFileName = value => matches(fileNamePattern, value);

// An exported image: <task ID>/<folder>/.../<name>.<ext>
export const isTaskFilePath = (value) => {
  if (typeof value !== 'string') {
    return false;
  }
  const parts = value.split('/');
  return parts.length >= 2
    && isTaskID(parts[0])
    && parts.slice(1, -1).every(isName)
    && isFileName(parts[parts.length - 1]);
};

export const notFound = (res) => {
  res.status(404);
  res.end();
};
