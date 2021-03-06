import fs from 'fs-extra';
import {uuid, sparqlEscapeUri, sparqlEscapeString, sparqlEscapeDateTime} from 'mu';
import {updateSudo as update} from '@lblod/mu-auth-sudo';


const HARVESTING_GRAPH = process.env.HARVESTING_GRAPH || 'http://mu.semte.ch/graphs/harvesting';

const CREATOR = 'http://lblod.data.gift/services/harvesting-initiation-service';

const TASK_URI_BASE = 'http://data.lblod.info/id/harvesting-task/';
const TASK_READY_STATUS = 'http://lblod.data.gift/harvesting-statuses/ready-for-collecting';

const COLLECTION_URI_BASE = 'http://data.lblod.info/id/harvesting-collection/';

const REMOTE_URI_BASE = 'http://data.lblod.info/id/remote-data-objects/';
const REMOTE_READY_STATUS = 'http://lblod.data.gift/file-download-statuses/ready-to-be-cached';

const PREFIXES = `
  PREFIX harvesting: <http://lblod.data.gift/vocabularies/harvesting/>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX adms: <http://www.w3.org/ns/adms#>
  PREFIX prov: <http://www.w3.org/ns/prov#>
  PREFIX nfo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#>
  PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>
  PREFIX rpioHttp: <http://redpencil.data.gift/vocabularies/http/>
  PREFIX http: <http://www.w3.org/2011/http#>
  PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
  PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
`;

export async function createTask(location) {
  // Shared properties
  const timestamp = new Date();

  // Harvesting Task properties
  const taskUUID = uuid();
  const taskURI = `${TASK_URI_BASE}${taskUUID}`

  // Harvesting Collection properties
  const collectionUUID = uuid();
  const collectionURI = `${COLLECTION_URI_BASE}${collectionUUID}`;

  // Remote properties
  const remoteUUID = uuid();
  const remoteURI = `${REMOTE_URI_BASE}${remoteUUID}`;

  await update(`
  ${PREFIXES}
  INSERT DATA {
    GRAPH ${sparqlEscapeUri(HARVESTING_GRAPH)} {
    
        ${sparqlEscapeUri(taskURI)} a harvesting:HarvestingTask;
                               mu:uuid ${sparqlEscapeString(taskUUID)};
                               dct:creator ${sparqlEscapeUri(CREATOR)};
                               adms:status ${sparqlEscapeUri(TASK_READY_STATUS)};
                               dct:created ${sparqlEscapeDateTime(timestamp)};
                               dct:modified ${sparqlEscapeDateTime(timestamp)};
                               prov:generated ${sparqlEscapeUri(collectionURI)}.
                               
        ${sparqlEscapeUri(collectionURI)} a harvesting:HarvestingCollection;
                               mu:uuid ${sparqlEscapeString(collectionUUID)};
                               dct:creator ${sparqlEscapeUri(CREATOR)};
                               dct:hasPart ${sparqlEscapeUri(remoteURI)} .
                               
        ${sparqlEscapeUri(remoteURI)} a nfo:RemoteDataObject, nfo:FileDataObject;
                                  rpioHttp:requestHeader <http://data.lblod.info/request-headers/accept/text/html>;
                                  mu:uuid ${sparqlEscapeString(remoteUUID)};
                                  nie:url ${sparqlEscapeUri(location)};
                                  dct:creator ${sparqlEscapeUri(CREATOR)};
                                  adms:status ${sparqlEscapeUri(REMOTE_READY_STATUS)};
                                  dct:created ${sparqlEscapeDateTime(timestamp)};
                                  dct:modified ${sparqlEscapeDateTime(timestamp)}.

        <http://data.lblod.info/request-headers/accept/text/html> a http:RequestHeader;
                                                                    http:fieldValue "text/html";
                                                                    http:fieldName "Accept";
                                                                    http:hdrName <http://www.w3.org/2011/http-headers#accept>.                                       
    }                      
  }
  `);
}

export async function getPagesToHarvest() {
  const config = JSON.parse(fs.readFileSync(`/config/initiator.json`));
  return config.pages;
}