import exists from './task-exists.js';
import logger from '../../../helpers/logging/logger.js';
import status from './task-status.js';
import updateStatus from './update-status.js';

jest.mock('../../../helpers/logging/logger.js');
jest.mock('./task-exists');
jest.mock('./task-status');
status.mockResolvedValue({
  'aB3_-xY9zQ1w2E': { date: 1, status: 'complete' },
  'cD4_-xY9zQ1w2F': { date: 2, status: 'running' },
});

const req = {
  params: {
    tasks: 'aB3_-xY9zQ1w2E;cD4_-xY9zQ1w2F;..;../../app;samplefile',
  },
};
const res = {
  end: jest.fn(),
  send: jest.fn(),
  status: jest.fn(),
};

describe('Task information', () => {
  describe('successfully', () => {
    beforeAll(async () => {
      res.send.mockClear();
      exists.mockResolvedValue();
      await updateStatus(req, res);
    });

    it('should only look up task folders', () => {
      expect(exists).toHaveBeenCalledWith(['aB3_-xY9zQ1w2E', 'cD4_-xY9zQ1w2F', 'samplefile']);
    });

    it('should send response with status status', () => {
      const expected = {
        tasks: {
          'aB3_-xY9zQ1w2E': { date: 1, status: 'complete' },
          'cD4_-xY9zQ1w2F': { date: 2, status: 'running' },
        },
      };
      expect(res.send).toHaveBeenCalledWith(expected);
    });
  });

  describe('unsuccessfully', () => {
    beforeAll(async () => {
      logger.error.mockClear();
      res.end.mockClear();
      res.status.mockClear();
      exists.mockImplementation(() => {
        throw new Error('cannot access file system');
      });
      await updateStatus(req, res);
    });

    it('should log error', () => {
      expect(logger.error).toHaveBeenCalledWith('update task status - Error: cannot access file system');
    });

    it('should set response status', () => {
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should end response', () => {
      expect(res.end).toHaveBeenCalled();
    });
  });
});
