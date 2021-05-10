const fs  = require("fs");

const { SolidNodeClient } = require("solid-node-client");
const home =  process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
const configFile = fs.readFileSync(`${home}/.solid-auth-cli-config.json`,'utf8');
const config = JSON.parse(configFile);

const client = new SolidNodeClient();
client.login(config).catch(console.error);
