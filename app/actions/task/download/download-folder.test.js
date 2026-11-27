import archive from './archive.js';
import downloadFolder from './download-folder.js';
import exists from '../../../helpers/download/exists.js';
import logger from '../../../helpers/logging/logger.js';

jest.mock('../../../config/config', () => ({
  workDir: 'tmp/',
}));
jest.mock('./archive.js');
jest.mock('../../../helpers/download/exists.js');
exists.mockResolvedValue();
jest.mock('../../../helpers/logging/logger.js');

const res = {
  end: jest.fn(),
  status: jest.fn(),
};

describe('Download folder', () => {
  describe('successfully', () => {
    it('should archive folder', async () => {
      archive.mockClear();
      const req = {
        params: {
          folder: 'aB3_-xY9zQ1w2E',
        },
      };
      await downloadFolder(req, res);
      expect(archive).toHaveBeenCalledWith('tmp/aB3_-xY9zQ1w2E', res);
    });
  });

  describe.each([
    '..',
    '../app',
    '/etc',
    'uploads',
    'samplefile',
    'archive',
  ])('refusing %p', (folder) => {
    beforeAll(async () => {
      archive.mockClear();
      exists.mockClear();
      res.end.mockClear();
      res.status.mockClear();
      await downloadFolder({ params: { folder } }, res);
    });

    it('should answer 404 without touching the file system', () => {
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.end).toHaveBeenCalled();
      expect(exists).not.toHaveBeenCalled();
      expect(archive).not.toHaveBeenCalled();
    });
  });

  describe('unsuccessfully', () => {
    beforeAll(async () => {
      logger.error.mockClear();
      res.end.mockClear();
      res.status.mockClear();
      archive.mockImplementation(() => {
        throw new Error('cannot archive folder');
      });
      const req = {
        params: {
          folder: 'aB3_-xY9zQ1w2E',
        },
      };
      await downloadFolder(req, res);
    });

    it('should log error', () => {
      expect(logger.error).toHaveBeenCalledWith('download folder - Error: cannot archive folder');
    });

    it('should set status', () => {
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should end response', () => {
      expect(res.end).toHaveBeenCalled();
    });
  });
});
