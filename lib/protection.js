import fs from 'fs';

const dbPath = './database/protection.json';
let protectionDB = fs.existsSync(dbPath)
  ? JSON.parse(fs.readFileSync(dbPath))
  : {};

const saveDB = () => {
  fs.writeFileSync(dbPath, JSON.stringify(protectionDB, null, 2));
};

export const isAntiPromoteOn = (groupId) => {
  return protectionDB[groupId]?.antipromote === true;
};

export const isAntiDemoteOn = (groupId) => {
  return protectionDB[groupId]?.antidemote === true;
};

export const setAntiPromote = (groupId, value) => {
  if (!protectionDB[groupId]) protectionDB[groupId] = {};
  protectionDB[groupId].antipromote = value;
  saveDB();
};

export const setAntiDemote = (groupId, value) => {
  if (!protectionDB[groupId]) protectionDB[groupId] = {};
  protectionDB[groupId].antidemote = value;
  saveDB();
};
