import downloadTaskFile from './download-task-file.js';
import exists from '../../../helpers/download/exists.js';
import logger from '../../../helpers/logging/logger.js';
import readStream from '../../../helpers/download/read-stream.js';

jest.mock('../../../config/config', () => ({
  archiveDir: 'archive/',
  workDir: 'tmp/',
}));
jest.mock('../../../helpers/download/exists.js');
jest.mock('../../../helpers/logging/logger.js');
jest.mock('../../../helpers/download/read-stream.js');

const existingFiles = [
  'archive/20261126Hcfj2QKH.json',
  'tmp/aB3_-xY9zQ1w2E/interactive/interactive-file.json',
];
exists.mockImplementation(async (file) => {
  if (!existingFiles.includes(file)) {
    throw new Error(`ENOENT: ${file}`);
  }
});

const res = {
  end: jest.fn(),
  status: jest.fn(),
};

const clearMocks = () => {
  exists.mockClear();
  readStream.mockClear();
  res.end.mockClear();
  res.status.mockClear();
};

describe('Download task file', () => {
  describe('for archive folder', () => {
    describe('successfully', () => {
      beforeAll(async () => {
        clearMocks();
        const req = {
          params: { filename: '20261126Hcfj2QKH', folder: 'archive' },
        };
        await downloadTaskFile(req, res);
      });

      it('should stream file to response', async () => {
        const expectedFilePath = 'archive/20261126Hcfj2QKH.json';
        expect(readStream).toHaveBeenCalledWith(expectedFilePath, res);
      });
    });

    describe('unsuccessfully', () => {
      // Error is thrown because the file doesn't exist.
      beforeAll(async () => {
        clearMocks();
        const req = {
          params: { filename: '20261126Missing1', folder: 'archive' },
        };
        await downloadTaskFile(req, res);
      });

      it('should set status', () => {
        expect(res.status).toHaveBeenCalledWith(500);
      });
      it('should end response', () => {
        expect(res.end).toHaveBeenCalled();
      });
    });

    describe.each([
      'white-list',
      '..',
      '../app/config/config',
      '../tmp/aB3_-xY9zQ1w2E/status',
    ])('refusing %p', (filename) => {
      beforeAll(async () => {
        clearMocks();
        await downloadTaskFile({ params: { filename, folder: 'archive' } }, res);
      });

      it('should answer 404 without touching the file system', () => {
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.end).toHaveBeenCalled();
        expect(exists).not.toHaveBeenCalled();
        expect(readStream).not.toHaveBeenCalled();
      });
    });
  });

  describe('for task folder', () => {
    describe('successfully', () => {
      beforeAll(async () => {
        clearMocks();
        const req = {
          params: { filename: 'interactive-file', folder: 'aB3_-xY9zQ1w2E' },
        };
        await downloadTaskFile(req, res);
      });

      it('should stream file to response', async () => {
        const expectedFilePath = 'tmp/aB3_-xY9zQ1w2E/interactive/interactive-file.json';
        expect(readStream).toHaveBeenCalledWith(expectedFilePath, res);
      });
    });

    describe('for the sample files', () => {
      beforeAll(async () => {
        clearMocks();
        const req = {
          params: { filename: 'dotplot', folder: 'samplefile' },
        };
        await downloadTaskFile(req, res);
      });

      it('should look for the file in the sample folder', () => {
        expect(exists).toHaveBeenCalledWith('tmp/samplefile/interactive/dotplot.json', res);
      });
    });

    describe('unsuccessfully', () => {
      // Error is thrown because the file doesn't exist.
      beforeAll(async () => {
        clearMocks();
        const req = {
          params: { filename: 'missing', folder: 'aB3_-xY9zQ1w2E' },
        };
        await downloadTaskFile(req, res);
      });

      it('should set status', () => {
        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should end response', () => {
        expect(res.end).toHaveBeenCalled();
      });
    });

    describe.each([
      ['..', 'interactive-file'],
      ['uploads', 'interactive-file'],
      ['aB3_-xY9zQ1w2E', '..'],
      ['aB3_-xY9zQ1w2E', '../../../app/config/config'],
      ['aB3_-xY9zQ1w2E', '/etc/passwd'],
    ])('refusing folder %p, file %p', (folder, filename) => {
      beforeAll(async () => {
        clearMocks();
        await downloadTaskFile({ params: { filename, folder } }, res);
      });

      it('should answer 404 without touching the file system', () => {
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.end).toHaveBeenCalled();
        expect(exists).not.toHaveBeenCalled();
        expect(readStream).not.toHaveBeenCalled();
      });
    });
  });

  describe('unsuccessful because of server error', () => {
    beforeAll(async () => {
      clearMocks();
      logger.error.mockClear();
      readStream.mockImplementation(() => {
        throw new Error('cannot read file');
      });
      const req = {
        params: { filename: '20261126Hcfj2QKH', folder: 'archive' },
      };
      await downloadTaskFile(req, res);
    });

    it('should log error', () => {
      expect(logger.error).toHaveBeenCalledWith('download task file - Error: cannot read file');
    });

    it('should set status', () => {
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should end response', () => {
      expect(res.end).toHaveBeenCalled();
    });
  });
});
