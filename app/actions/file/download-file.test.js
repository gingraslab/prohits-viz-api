import downloadFile from './download-file.js';
import exists from '../../helpers/download/exists.js';
import logger from '../../helpers/logging/logger.js';
import readStream from '../../helpers/download/read-stream.js';

jest.mock('../../config/config', () => ({
  workDir: 'tmp/',
}));
jest.mock('../../helpers/download/exists');
exists.mockResolvedValue();
jest.mock('../../helpers/logging/logger.js');
jest.mock('../../helpers/download/read-stream');
readStream.mockResolvedValue();

const req = {
  params: { file: 'aB3_-xY9zQ1w2E/svg/image.svg' },
};
const res = {
  end: jest.fn(),
  status: jest.fn(),
};

describe('Downloading a file', () => {
  describe.each([
    '../app/config/config.js',
    'aB3_-xY9zQ1w2E/../../app/config/config.js',
    '%2e%2e/app/config/config.js',
    '/etc/passwd',
    'samplefile/interactive/dotplot.json',
    'uploads/file.txt',
  ])('refusing %p', (file) => {
    beforeAll(async () => {
      exists.mockClear();
      readStream.mockClear();
      res.end.mockClear();
      res.status.mockClear();
      await downloadFile({ params: { file } }, res);
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
      await downloadFile(req, res);
    });

    it('should check if file exists', () => {
      expect(exists).toHaveBeenCalledWith('tmp/aB3_-xY9zQ1w2E/svg/image.svg', res);
    });

    it('should stream file to download', () => {
      expect(readStream).toHaveBeenCalledWith('tmp/aB3_-xY9zQ1w2E/svg/image.svg', res, true);
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
      await downloadFile(req, res);
    });

    it('should log error', () => {
      expect(logger.error).toHaveBeenCalledWith('download file - Error: cannot access file system');
    });

    it('should set status code response', () => {
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should end response', () => {
      expect(res.end).toHaveBeenCalled();
    });
  });
});
