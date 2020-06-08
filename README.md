# harvesting-initiation-service

Microservice that generates harvesting tasks. 
A cron job is embedded in the service to initiate a harvest at the preconfigured frequency.

## Installation

To add the service to your stack, add the following snippet to docker-compose.yml:

```
services:
  harvesting-initiation:
    image: lblod/harvesting-initiation-service:x.x.x
    volumes:
      - ./config/harvesting:/config
```

## Configuration

### initiator.json

contains the list of pages urls that need to be processed:

```
{
  "pages": [
    "https://example.be/publication"
  ]
}
```

### Environment variables

 - **INITIATE_HARVEST_CRON_PATTERN**: cron pattern to configure the frequency of the cron job. 
   The pattern follows the format as specified in node-cron. Defaults to 0 0 */2 * * *, run every 2 hours.
 - **HARVESTING_GRAPH**: graph where all the triples/data in connection with the harvesting-task(s) will reside. 
   Defaults to <http://mu.semte.ch/graphs/harvesting>.
   
## REST API

### POST /initiate-harvest

Initiate a new harvest asynchronously.

Returns `202 Accepted` if the harvesting started successfully.

Returns `500 Bad Request` if something went unexpected went wrong while initiating the harvest.

## Model

### Used prefixes

Prefix | URI 
--- | --- 
harvesting: |  <http://lblod.data.gift/vocabularies/harvesting/>
mu:  | <http://mu.semte.ch/vocabularies/core/>
dct:  | <http://purl.org/dc/terms/>
adms: | <http://www.w3.org/ns/adms#>
prov: | <http://www.w3.org/ns/prov#>
nfo: | <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#>
nie: | <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>

### Harvesting Task

Periodically this service will create harvesting tasks. The task describes the status and progress of the harvesting flow.

#### Class

`harvesting:HarvestingTask`

### Properties

 Name | Predicate | Range | Definition 
--- | --- | --- | ---
status | `adms:status` | `adms:Status` | Status of the task, initially set to `http://lblod.data.gift/harvesting-statuses/ready-for-collecting`
created |`dct:created`|`xsd:dateTime`| Datetime of creation of the task
modified |`dct:modified`|`xsd:dateTime`| Datetime on which the task was modified
creator |`dct:creator`|`rdfs:Resource`| Creator of the task, in this case the harvest-initiation-service <http://lblod.data.gift/services/harvest-initiation-service>
harvestingCollection |`prov:generated`|`harvesting:HarvestingCollection`| HarvestingCollection generated by the task

#### Harvesting task statuses

The status of the task will be updated by other micro-services to reflect the progress of the harvesting progress. The following statuses are known:

- http://lblod.data.gift/harvesting-statuses/ready-for-collecting

## HarvestingCollection

The service will create the harvesting collection that will contain the resource/file than needs to be downloaded (and later harvested). This will be updated further/enriched by the `harvest-collector-service`.

### Class

`harvesting:HarvestingCollection`


### Properties

 Name | Predicate | Range | Definition 
--- | --- | --- | ---
status | `adms:status` | `adms:Status`| Status of the task, initially set to `http://lblod.data.gift/collecting-statuses/not-started`
remoteDataObject | `dct:hasPart` | `nfo:RemoteDataObject` | page/resource to be downloaded/collected for this harvesting task

### Collecting statuses

The status of the task will be updated by other micro-services to reflect the progress of the collecting progress. The following statuses are known:

- http://lblod.data.gift/collecting-statuses/not-started

## RemoteDataObject

The service will create an initial remote-data-object for source URL which will be downloaded by the download-url-service.

### Class

`nfo:RemoteDataObject`

### Properties

The model of the remote data object is described in the README of the download-url-service. 
But the following will be needed to initiate a download:

 Name | Predicate | Range | Definition 
--- | --- | --- | ---
status | `adms:status` | `adms:Status`| Status of the task, initially set to `http://lblod.data.gift/file-download-statuses/ready-to-be-cached`
source |`nie:url`| | the URL that needs to be downloaded