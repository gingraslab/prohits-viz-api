import downloadDataFile from './download-data-file.js';
import exists from '../../helpers/download/exists.js';
import logger from '../../helpers/logging/logger.js';
import readStream from '../../helpers/download/read-stream.js';

jest.mock('../../config/config', () => ({
  dataDir: 'files/',
}));
jest.mock('../../helpers/download/exists');
exists.mockResolvedValue();
jest.mock('../../helpers/logging/logger.js');
jest.mock('../../helpers/download/read-stream');
readStream.mockResolvedValue();

const req = {
  params: { file: 'rna-tissues.json' },
};
const res = {
  end: jest.fn(),
  status: jest.fn(),
};

describe('Downloading a file', () => {
  describe.each([
    '../app/config/config.js',
    '..',
    'rna-tissues',
    '/etc/passwd',
  ])('refusing %p', (file) => {
    beforeAll(async () => {
      exists.mockClear();
      readStream.mockClear();
      res.end.mockClear();
      res.status.mockClear();
      await downloadDataFile({ params: { file } }, res);
    });

    it('should answer 404', () => {
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.end).toHaveBeenCalled();
    });

    it('should not touch the file system', () => {
      expect(exists).not.toHaveBeenCalled();
      expect(readStream).not.toHaveBeenCalled();
    });
  });

  describe('successfully', () => {
    beforeAll(async () => {
      res.end.mockClear();
      res.status.mockClear();
      await downloadDataFile(req, res);
    });

    it('should check if file exists', () => {
      expect(exists).toHaveBeenCalledWith('files/rna-tissues.json', res);
    });

    it('should stream file to download', () => {
      expect(readStream).toHaveBeenCalledWith('files/rna-tissues.json', res);
    });

    it('should not end response', () => {
      expect(res.end).not.toHaveBeenCalled();
    });
  });

  describe('unsuccessfully', () => {
    beforeAll(async () => {
      logger.error.mockClear();
      exists.mockImplementation(() => {
        throw new Error('cannot access file system');
      });
      await downloadDataFile(req, res);
    });

    it('should log error', () => {
      expect(logger.error).toHaveBeenCalledWith('download data file - Error: cannot access file system');
    });

    it('should set status code response', () => {
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should end response', () => {
      expect(res.end).toHaveBeenCalled();
    });
  });
});
