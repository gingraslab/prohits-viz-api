import mockFS from 'mock-fs';
import stream from 'stream';

import extToMimeType from './ext-to-mime-type.js';
import readStream, { removeFileOnCompletion } from './read-stream.js';
import removeFile from '../files/remove-file.js';

jest.mock('../../config/config.js', () => ({ workDir: 'tmp/' }));
jest.mock('./ext-to-mime-type');
extToMimeType.mockReturnValue('svg');
jest.mock('../files/remove-file.js');
removeFile.mockResolvedValue();
jest.mock('../logging/logger.js');

const taskID = 'aB3_-xY9zQ1w2E';

const res = new stream.Writable();
res._write = (chunk, encoding, done) => {
  done();
};
res.end = jest.fn();
res.setHeader = jest.fn();
res.status = jest.fn();

beforeAll(() => {
  mockFS({
    tmp: {
      [taskID]: {
        'file.svg': 'file content',
      },
    },
  });
});

afterAll(() => {
  mockFS.restore();
});

describe('Remove file', () => {
  it('should remove the task folder', () => {
    removeFile.mockClear();
    removeFileOnCompletion(`tmp/${taskID}/svg/file.svg`, true);
    expect(removeFile).toHaveBeenCalledWith(`tmp/${taskID}`);
  });

  it('should remove a folder made by the Prohits LIMS', () => {
    removeFile.mockClear();
    removeFileOnCompletion('tmp/GAVAcfHPB5/svg/file.svg', true);
    expect(removeFile).toHaveBeenCalledWith('tmp/GAVAcfHPB5');
  });

  it('should not remove file', () => {
    removeFile.mockClear();
    removeFileOnCompletion(`tmp/${taskID}/svg/file.svg`, false);
    expect(removeFile).not.toHaveBeenCalled();
  });

  it.each([
    'tmp/samplefile/interactive/dotplot.json',
    'tmp/uploads/file.txt',
    'tmp/../app/config/config.js',
    `tmp/../${taskID}/file.svg`,
    'files/rna-tissues.json',
    `/tmp/${taskID}/file.svg`,
    'tmp/',
  ])('should never remove anything for %p', (file) => {
    removeFile.mockClear();
    removeFileOnCompletion(file, true);
    expect(removeFile).not.toHaveBeenCalled();
  });
});

describe('Streaming a file to response', () => {
  describe('when successful', () => {
    describe('and not deleting working directory', () => {
      beforeAll(async () => {
        removeFile.mockClear();
        res.end.mockClear();
        res.setHeader.mockClear();
        await readStream(`tmp/${taskID}/file.svg`, res);
      });

      it('should set content-type to mime type', () => {
        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'svg');
      });

      it('should end response', () => {
        expect(res.end).toHaveBeenCalled();
      });

      it('should not delete working directory', () => {
        expect(removeFile).not.toHaveBeenCalled();
      });
    });

    describe('and deleting working directory', () => {
      beforeAll(async () => {
        removeFile.mockClear();
        res.end.mockClear();
        res.setHeader.mockClear();
        await readStream(`tmp/${taskID}/file.svg`, res, true);
      });

      it('should delete working directory', () => {
        expect(removeFile).toHaveBeenCalledWith(`tmp/${taskID}`);
      });
    });
  });

  describe('when unsuccessful', () => {
    let error;

    beforeAll(async () => {
      res.end.mockClear();
      res.setHeader.mockClear();
      try {
        await readStream(`tmp/${taskID}/missing.svg`, res);
      } catch (err) {
        error = err;
      }
    });

    it('should set content-type to mime type', () => {
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'svg');
    });

    it('should not end response', () => {
      expect(res.end).not.toHaveBeenCalled();
    });

    it('should return error', () => {
      expect(error.toString()).toBe(`Error: Could not read: tmp/${taskID}/missing.svg`);
    });
  });
});
