import { app, errorHandler } from 'mu';
import { CronJob } from 'cron';
import rp from 'request-promise';

import {createTask, getPublications} from "./rdflib";

/** Schedule export cron job */
const cronFrequency = process.env.INITIATE_HARVEST_CRON_PATTERN || '0 0 */2 * * *';
new CronJob(cronFrequency, function() {
  console.log(`Harvest initiated by cron job at ${new Date().toISOString()}`);
  rp.post('http://localhost/initiate-harvest');
}, null, true);

app.get('/', function( req, res ) {
  res.send('Hello harvesting-initiation-service');
});

app.post('/initiate-harvest', async function(req, res){
  try{
    initiateHarvest(); // don't await this call since the export is executed asynchronously
    res.status(202).send().end();
  }catch (e) {
    console.log('WARNING: something went wrong while initiating the harvest.');
    console.error(e);
    res.status(400).send(e.message).end();
  }

});

async function initiateHarvest() {
  console.log("Start retrieval of publication root locations")
 const publications = await getPublications();
 console.log('Start creation of harvesting tasks');
 for(let publication of publications) {
   await createTask(publication);
   console.log(`Created harvesting task for <${publication}>`);
 }
}

app.use(errorHandler);