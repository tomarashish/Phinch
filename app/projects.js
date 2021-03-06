import { homedir, platform } from 'os';
import fs from 'fs';
import { join } from 'path';

import newicon from 'images/newicon.png';
import sampleicon from 'images/sampleicon.png';

const sampleProjects = [
  {
    name: 'Sample Project One',
    slug: 'sampleprojectone',
    thumb: sampleicon
  },
  {
    name: 'Sample Project Two',
    slug: 'sampleprojecttwo',
    thumb: sampleicon
  },
];

const homedirectory = homedir();

function checkFolders() {
  // maybe check platform? console.log(platform());
  // check settings file - look somewhere other than home folder

  const home = fs.readdirSync(join(homedirectory));
  if (!home.includes('Documents')) { // weird but ok
    fs.mkdirSync(join(homedirectory, 'Documents'));
  }
  const documents = fs.readdirSync(join(homedirectory, 'Documents'));
  if (!documents.includes('Phinch2.0')) {
    fs.mkdirSync(join(homedirectory, 'Documents', 'Phinch2.0'));
  }
}

function getProjectInfo(path, project) {
  let name = project;
  if (fs.existsSync(join(path, `${project}.json`))) {
    const tmpname = JSON.parse(fs.readFileSync(join(path, `${project}.json`), 'utf8')).name;
    if (tmpname) {
      name = tmpname;
    }
  }
  let thumb = '';
  if (fs.existsSync(join(path, `${project}.png`))) {
    thumb = `data:image/png;base64, ${fs.readFileSync(join(path, `${project}.png`), 'base64')}`;
  }
  let data = '';
  if (fs.existsSync(join(path, `${project}.biom`))) {
    data = join(path, `${project}.biom`);
  }
  return {
    name: name,
    slug: 'filter',
    thumb: thumb,
    path: path,
    data: data,
  }
}

export function exportProjectData(path, name, data, callback) {
  const projectdir = join('/', ...path);
  const project = fs.readdirSync(projectdir);
  let version = 0;
  let exportname = `export-${version}-${name}`;
  while (project.includes(exportname)) {
    version++;
    exportname = `export-${version}-${name}`;
  }
  const exportPath = join('/', ...path, exportname);
  try {
    fs.writeFileSync(exportPath, JSON.stringify(data));
    callback('Exported');
  } catch (e) {
    callback('Error');
  }
}

export function setProjectFilters(path, name, names, view, callback) {
  name = name.replace('.biom', '.json');
  const metadataPath = join('/', ...path, name);
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  metadata.names = names;
  // 
  if (!metadata[view.type]) {
    metadata[view.type] = {};
  }
  Object.keys(view).forEach(k => {
    if (k !== 'type') {
      metadata[view.type][k] = view[k];
    }
  });
  //
  try {
    fs.writeFileSync(metadataPath, JSON.stringify(metadata));
    callback('Saved');
  } catch (e) {
    callback('Error');
  }
}

export function getProjectFilters(path, name, viewType) {
  name = name.replace('.biom', '.json');
  const metadataPath = join('/', ...path, name);
  const metadata = path.length ? JSON.parse(fs.readFileSync(metadataPath, 'utf8')) : {};
  const names = metadata['names'] ? metadata['names'] : {};
  //
  const filters = { names };
  if (metadata[viewType]) {
    Object.keys(metadata[viewType]).forEach(k => {
      if (metadata[viewType][k]) {
        filters[k] = metadata[viewType][k];
      }
    });
  }
  return filters;
}

export function createProject(project) {
  checkFolders();
  const phinchdir = join(homedirectory, 'Documents', 'Phinch2.0');
  const phinch = fs.readdirSync(phinchdir);
  //
  const basename = project.name.split('.').slice(0, -1).join('.');
  let foldername = basename;
  let version = 0;
  while (phinch.includes(foldername)) {
    foldername = `${basename}-${version}`;
    version++;
  }
  //
  fs.mkdirSync(join(phinchdir, foldername));
  const filepath = join(phinchdir, foldername, `${foldername}.biom`);
  fs.writeFileSync(filepath, JSON.stringify(project.data));
  const projectSettings = {
    phinch: {
      name: foldername,
      path: join(phinchdir, foldername),
    },
  };
  fs.writeFileSync(join(phinchdir, foldername, `${foldername}.json`), JSON.stringify(projectSettings));
  fs.writeFileSync(join(phinchdir, foldername, `${foldername}.png`), sampleicon.replace(/^data:image\/png;base64,/, ''), 'base64');
  //
  return filepath;
}

export function getProjects() {
  checkFolders();
  const projects = fs.readdirSync(join(homedirectory, 'Documents', 'Phinch2.0'))
    .filter(f => f !== 'Samples')
    .filter(f => fs.lstatSync(join(homedirectory, 'Documents', 'Phinch2.0', f)).isDirectory())
    .map((p) => {
      // check for files inside phinch directory folders (data*, settings, thumbnails, etc)
      const path = join(homedirectory, 'Documents', 'Phinch2.0', p);
      return getProjectInfo(path, p);
    });
  //
  const newproject = {
    name: 'New Project',
    slug: 'newproject',
    thumb: newicon
  };
  projects.unshift(newproject);
  return projects;
}

export function getSamples() {
  checkFolders();
  const phinchdir = join(homedirectory, 'Documents', 'Phinch2.0');
  const phinch = fs.readdirSync(phinchdir);
  if (!phinch.includes('Samples')) {
    fs.mkdirSync(join(phinchdir, 'Samples'));
    // Make our 2 default samples now
    sampleProjects.forEach((s) => {
      fs.mkdirSync(join(phinchdir, 'Samples', s.slug));
      fs.writeFileSync(join(phinchdir, 'Samples', s.slug, `${s.slug}.json`), JSON.stringify({name:s.name}));
      fs.writeFileSync(join(phinchdir, 'Samples', s.slug, `${s.slug}.png`), s.thumb.replace(/^data:image\/png;base64,/, ''), 'base64');
      // add some data lol idk
    });
  }
  const samples = fs.readdirSync(join(phinchdir, 'Samples'))
    .filter(f => fs.lstatSync(join(phinchdir, 'Samples', f)).isDirectory())
    .map((s) => {
      const path = join(phinchdir, 'Samples', s);
      return getProjectInfo(path, s);
    });
  return samples;
}
