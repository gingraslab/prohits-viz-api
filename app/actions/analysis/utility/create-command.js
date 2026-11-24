// Every value is single-quoted for the shell: file names and column names come from the user.
const q = value => `'${String(value).replace(/'/g, "'\\''")}'`;

const docker = 'docker run --rm -v "$(pwd)":/files/ --user "$(id -u):$(id -g)" pvutilitiespython ';

const scripts = {
  crispr_convert: fields => `${docker}/app/crispr_convert/main.py `
    + `-f files -t ${q(fields.tool)}`,
  pvconvert: fields => `pvconvert --file=${q(fields.files[0])} --imageType=${q(fields.imageType)}`,
  saint_biogrid_network: fields => `${docker}/app/text_biogrid_network/main.py `
    + `-k ${q(fields.accessKey)} -el ${q(fields.evidenceList.join('|'))} -f ${q(fields.files[0])} `
    + `-fdr ${q(fields.fdr)} -it symbol -ie ${q(fields.includeEvidence)} `
    + `-ipi ${q(fields.includePrimaryInteractions)} -isi ${q(fields.includeSecondaryInteractions)} -isai ${q(fields.includeSaintInteractions)} `
    + `-ise ${q(fields.interSpeciesExcluded)} -is true -g ${q(fields.geneFile)} `
    + `-m ${q(fields.max)} -tt ${q(fields.throughputTag)}`,
  saint_domain_enrich: fields => `${docker}/app/saint_domain_enrich/main.py `
    + `-b ${q(fields.background)} -f ${q(fields.fdr)} -i ${q(fields.idType)} -s ${q(fields.files[0])} -t ${q(fields.topPreys)} `
    + `-d ${q(fields.domainFile)} -g ${q(fields.geneFile)}`,
  saint_fea: fields => `${docker}/app/saint_fea/main.py `
    + `-f ${q(fields.fdr)} -s ${q(fields.files[0])} -t ${q(fields.topPreys)}`,
  saint_specificity: fields => `${docker}/app/saint_specificity/main.py `
    + `-c ${q(fields.controlSubtract)} -m ${q(fields.metric)} -s ${q(fields.files[0])}`,
  saint_stats: fields => `${docker}/app/saint_stats/main.py `
    + `-f ${q(fields.fdr)} -s ${q(fields.files[0])}`,
  text_biogrid_network: fields => `${docker}/app/text_biogrid_network/main.py `
    + `-k ${q(fields.accessKey)} -el ${q(fields.evidenceList.join('|'))} -f ${q(fields.files[0])} `
    + `-it ${q(fields.idType)} -ie ${q(fields.includeEvidence)} `
    + `-ipi ${q(fields.includePrimaryInteractions)} -isi ${q(fields.includeSecondaryInteractions)} `
    + `-ise ${q(fields.interSpeciesExcluded)} -g ${q(fields.geneFile)} `
    + `-m ${q(fields.max)} -tt ${q(fields.throughputTag)}`,
  text_symbol_fix: fields => `${docker}/app/text_symbol_fix/main.py `
    + `-c ${q(fields.columns.join('|'))} -f ${q(fields.files[0])}`,
};

const createCommand = fields => scripts[fields.utility](fields);

export default createCommand;
