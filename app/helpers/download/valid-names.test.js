import {
  isArchiveID,
  isFileName,
  isName,
  isTaskFilePath,
  isTaskFolder,
  isTaskID,
} from './valid-names.js';

const unsafe = [
  '',
  '.',
  '..',
  '../',
  '..%2F',
  '%2e%2e',
  '/etc/passwd',
  'a/b',
  'a\\b',
  'name with space',
  'name\0',
  undefined,
  null,
  ['aB3_-xY9zQ1w2E'],
];

describe('Download name checks', () => {
  describe('task ID', () => {
    it('should accept a work folder ID', () => {
      expect(isTaskID('aB3_-xY9zQ1w2E')).toBe(true);
      expect(isTaskID('-B3_-xY9zQ1w2E')).toBe(true);
    });

    it('should accept a folder made by the Prohits LIMS', () => {
      expect(isTaskID('GAVAcfHPB5')).toBe(true);
      expect(isTaskID('GAVAcf_PB5')).toBe(false);
    });

    it('should refuse other lengths and the reserved tmp folders', () => {
      expect(isTaskID('aB3_-xY9zQ1w2')).toBe(false);
      expect(isTaskID('aB3xY9zQ1')).toBe(false);
      expect(isTaskID('aB3_-xY9zQ1w2Ex')).toBe(false);
      expect(isTaskID('samplefile')).toBe(false);
      expect(isTaskID('uploads')).toBe(false);
      expect(isTaskID('test')).toBe(false);
    });

    it.each(unsafe)('should refuse %p', (value) => {
      expect(isTaskID(value)).toBe(false);
    });

    it('should refuse .. hidden in 14 characters', () => {
      expect(isTaskID('..aB3_-xY9zQ1w')).toBe(false);
      expect(isTaskID('aB3_-xY9zQ1/..')).toBe(false);
    });
  });

  describe('task folder', () => {
    it('should accept a task ID and the sample files', () => {
      expect(isTaskFolder('aB3_-xY9zQ1w2E')).toBe(true);
      expect(isTaskFolder('samplefile')).toBe(true);
    });

    it('should refuse the uploads folder', () => {
      expect(isTaskFolder('uploads')).toBe(false);
    });

    it.each(unsafe)('should refuse %p', (value) => {
      expect(isTaskFolder(value)).toBe(false);
    });
  });

  describe('archive ID', () => {
    it('should accept saved session IDs', () => {
      expect(isArchiveID('20261126Hcfj2QKH')).toBe(true);
      expect(isArchiveID('2026117iXBeiLqw')).toBe(true);
      expect(isArchiveID('2024913K3ezkEfS')).toBe(true);
    });

    it('should refuse the white-list', () => {
      expect(isArchiveID('white-list')).toBe(false);
    });

    it.each(unsafe)('should refuse %p', (value) => {
      expect(isArchiveID(value)).toBe(false);
    });
  });

  describe('name', () => {
    it('should accept result file names', () => {
      expect(isName('dotplot')).toBe(true);
      expect(isName('Bait-PreyGene')).toBe(true);
      expect(isName('condition-condition')).toBe(true);
    });

    it.each(unsafe)('should refuse %p', (value) => {
      expect(isName(value)).toBe(false);
    });
  });

  describe('file name', () => {
    it('should accept a name with an extension', () => {
      expect(isFileName('rna-tissues.json')).toBe(true);
      expect(isFileName('dotplot.svg')).toBe(true);
    });

    it('should refuse names without one extension', () => {
      expect(isFileName('rna-tissues')).toBe(false);
      expect(isFileName('..json')).toBe(false);
      expect(isFileName('a.b.json')).toBe(false);
    });

    it.each(unsafe)('should refuse %p', (value) => {
      expect(isFileName(value)).toBe(false);
    });
  });

  describe('task file path', () => {
    it('should accept an exported image', () => {
      expect(isTaskFilePath('aB3_-xY9zQ1w2E/svg/dotplot.svg')).toBe(true);
      expect(isTaskFilePath('aB3_-xY9zQ1w2E/dotplot.png')).toBe(true);
    });

    it('should refuse paths that leave the task folder', () => {
      expect(isTaskFilePath('../app/config/config.js')).toBe(false);
      expect(isTaskFilePath('aB3_-xY9zQ1w2E/../../app/config/config.js')).toBe(false);
      expect(isTaskFilePath('aB3_-xY9zQ1w2E/svg/../../x.svg')).toBe(false);
      expect(isTaskFilePath('/aB3_-xY9zQ1w2E/svg/dotplot.svg')).toBe(false);
      expect(isTaskFilePath('aB3_-xY9zQ1w2E//dotplot.svg')).toBe(false);
    });

    it('should refuse the reserved tmp folders', () => {
      expect(isTaskFilePath('samplefile/interactive/dotplot.json')).toBe(false);
      expect(isTaskFilePath('uploads/x/file.txt')).toBe(false);
    });

    it('should refuse a folder alone', () => {
      expect(isTaskFilePath('aB3_-xY9zQ1w2E')).toBe(false);
    });

    it.each(unsafe)('should refuse %p', (value) => {
      expect(isTaskFilePath(value)).toBe(false);
    });
  });
});
