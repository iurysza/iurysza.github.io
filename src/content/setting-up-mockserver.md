---
layout: post
title: Setting up MockServer
image: img/mock-server.jpg
author: [Iury Souza]
date: 2020-04-21T07:03:47.149Z
tags: [ docker, testing ]
---

## Main goals:

- Simple and declarative testing environment setup.
- Runs everywhere

## Strategy

- Set up a replicable local server.

  Docker - *Containerized applications (actually write once, runs anywhere)*

- Provide an expectations json where all the requests are mapped out.

  MockServer - Create local server with complex request/response expectations through a json resource or a REST API.

    <img src="https://miro.medium.com/max/1400/0*LOnXgsR6pNv7mHvu.png" alt="MockServer" style="zoom:33%;" />



## Making it happen

- [Install Docker](https://docs.docker.com/get-docker/).

- Install [Docker Compose](https://docs.docker.com/compose/install/).

- Make sure your docker daemon is up and running.

- Create a folder for your MockServer setup.

  ```bash
  $ mkdir /path/to/mockserver_container/ && cd /path/to/mockserver_container
  ```

- Create the `docker-compose.yml` .

  - This is where you'll setup your container for MockServer.

  ```bash
  $ touch ./docker-compose.yml && nano ./docker-compose.yml
  ```

  Paste this code snippet:

  ```yaml
version: "2.4"
services:
mockServer:
image: mockserver/mockserver:latest
ports:
- 1080:1080
  environment:
  MOCKSERVER_PROPERTY_FILE: /config/mockserver.properties
  MOCKSERVER_INITIALIZATION_JSON_PATH: /config/initializerJson.json
  volumes:
- type: bind
  source: .
  target: /config

  ```
  
  This is saying:
  
  - Create a service named `mockserver` using the docker image from `mockserver/mockserver:latest`.

  - Assign the `host port` 1080 to the `container port` 1080.
  - Set the `enviroment variables` to the provided paths.
    
  - Create a `volume` binding from the `current directory` (this file's dir) to `/config` inside the container.

- Setup the Expectation Initializer JSON.

  - Create the `initializerJson`

  ```bash
  $ touch ./initializerJson.json && nano ./initializerJson.json
  ```

- Paste this code snippet:

  ```json
  [
    {
      "httpRequest" : {
        "method" : "GET",
        "path" : "/api/v1/weather",
        "queryStringParameters" : {
          "code" : ["10969"]
      }
    },
      "httpResponse" : {
        "body" : "{\"wheather\": 20.5}",
        "statusCode": 200
      }
    }
  ]
  
  ```

Full documentation reference can be found [here](https://app.swaggerhub.com/apis/jamesdbloom/mock-server-openapi/5.9.x#/Expectation)

## Running your container

Now that we've got the plumbing out of the way, it's time to run it.

- Before running your container check if have any other containers in your environment:

  ```bash
  $ docker ps -a
  ```

  This should print an empty table.

-  Build your container:

- Inside the folder you created the `.yml` type:

```bash
$ docker-compose up
```

Your terminal should print something like this:

```bash
Creating mockserver_mockServer_1 ... done
Attaching to mockserver_mockServer_1
mockServer_1  | 
mockServer_1  | java  -Dfile.encoding=UTF-8 -jar /opt/mockserver/mockserver-netty-jar-with-dependencies.jar  -server
mockServer_1  | 
mockServer_1  | 2020-04-11 15:52:30  org.mockserver.log.MockServerEventLog  INFO  creating expectation:
mockServer_1  | 
mockServer_1  |   {
mockServer_1  |     "id" : "3f3962d2-9c03-4dce-95cd-2522962ceccb",
mockServer_1  |     "priority" : 0,
mockServer_1  |     "httpRequest" : {
mockServer_1  |       "method" : "GET",
mockServer_1  |       "path" : "/api/v1/weather",
mockServer_1  |       "queryStringParameters" : {
mockServer_1  |         "code" : [ "10969" ]
mockServer_1  |       }
mockServer_1  |     },
mockServer_1  |     "times" : {
mockServer_1  |       "unlimited" : true
mockServer_1  |     },
mockServer_1  |     "timeToLive" : {
mockServer_1  |       "unlimited" : true
mockServer_1  |     },
mockServer_1  |     "httpResponse" : {
mockServer_1  |       "statusCode" : 200,
mockServer_1  |       "body" : "{\"wheather\": 20.5}"
mockServer_1  |     }
mockServer_1  |   }
mockServer_1  |  
mockServer_1  | 2020-04-11 15:52:30  org.mockserver.cli.Main  INFO  logger level is INFO, change using:
mockServer_1  |  - 'ConfigurationProperties.logLevel(String level)' in Java code,
mockServer_1  |  - '-logLevel' command line argument,
mockServer_1  |  - 'mockserver.logLevel' JVM system property or,
mockServer_1  |  - 'mockserver.logLevel' property value in 'mockserver.properties' 
mockServer_1  | 2020-04-11 15:52:30  org.mockserver.log.MockServerEventLog  INFO  started on port: 1080 


```

## Sending requests

Open a new terminal window and enter:

To see info about your available containers enter again:

```bash
$ docker ps -a
```

You can now see some info about your running container.

```bash
$ curl localhost:1080/api/v1/weather\?code\=10969           
```

You should see the response:

```
{"wheather": 20.5}
```

And thats it!

You've got yourself a local server where you can mock simple and complex requests and responses.

### Useful links:

[REST API Swagger docs](https://app.swaggerhub.com/apis/jamesdbloom/mock-server-openapi/5.9.x)
