import { app, errorHandler } from 'mu';
import {createTask} from "./rdflib";

app.get('/', function( req, res ) {
  res.send('Hello harvesting-initiation-service');
});

app.get('/initiate', async function(req, res){
  try{
    initiateHarvest();
    res.status(200).send().end();
  }catch (e) {
    console.error(e);
    res.status(400).send().end();
  }

});

async function initiateHarvest() {
 console.log("-- initiating harvest --")
 const publications = await getPublications();

 console.log("-- creating tasks --")
 for(let publication of publications) {
   await createTask(publication);
 }
}

async function getPublications() {
  return [
    'https://publicatie.gelinkt-notuleren.vlaanderen.be/Genk/Gemeente'
  ]
}

app.use(errorHandler);