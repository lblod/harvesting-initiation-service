import {app, errorHandler} from 'mu';
import {CronJob} from 'cron';
import rp from 'request-promise';

import {createTask, getPagesToHarvest} from "./initiation-task";

/** Schedule export cron job */
const cronFrequency = process.env.INITIATE_HARVEST_CRON_PATTERN || '0 0 */2 * * *';
new CronJob(cronFrequency, function () {
  console.log(`Harvest initiated by cron job at ${new Date().toISOString()}`);
  rp.post('http://localhost/initiate-harvest');
}, null, true);

app.get('/', function (req, res) {
  res.send('Hello harvesting-initiation-service');
});

app.post('/initiate-harvest', async function (req, res) {
  try {
    initiateHarvest(); // don't await this call since the export is executed asynchronously
    res.status(202).send().end();
  } catch (e) {
    console.log('WARNING: something went wrong while initiating the harvest.');
    console.error(e);
    res.status(500).send(e.message).end();
  }

});

async function initiateHarvest() {
  const pages = await getPagesToHarvest();
  console.log('START creation of harvesting tasks');
  for (let page of pages) {
    try {
      await createTask(page);
      console.log(`Created harvesting task for <${page}>`);
    }catch (e){
      console.log(`WARNING: something went wrong while initiating the harvesting-task for <${page}>.`);
      console.error(e);
    }
  }
  console.log("FINISHED creation of harvesting tasks")
}

app.use(errorHandler);