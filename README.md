# Veeve Tech Beer List Site

Veeve Tech Beer List web page

## Prerequisites

- [Docker][]

## Building

The Dockerfile for this project will attempt to find a copy '.config.json' from the root of this project when run, so that file must be created before executing a [Docker][] build. See [default-config.json](./default-config.json) for the required format of that config file. Once '.config.json' has been created a [Docker][] container image can be built with:

```sh
docker built -t beer-list-site .
```

## Running

The site can be run with the following command:

```sh
docker run -d -p <host-port>:1337 beer-list-site
```

## API

In order for the site to work correctly an instance of [Veeve Tech Beer List API][] needs to be running and accessible to it at the 'api.host' and 'api.port' defined in '.config.json'. Since the API currently has no authentication one may wish to make it accessible only to the beer-list-site container. One way of achieving this is to use a custom [Docker][] network, like so (assuming an [API][Veeve Tech Beer List API] instance of 'beer-list-api' and a [Site][Veeve Tech Beer List Site] instance of 'beer-list-site'):

```sh
docker network create --internal beer-list-net
docker network connect beer-list-net beer-list-api
docker network connect beer-list-net beer-list-site
```


[Veeve Tech Beer List API]: https://github.com/dpbricher/veeve-tech-beer-list-api
[Veeve Tech Beer List Site]: #veeve-tech-beer-list-site
[Docker]:                   https://www.docker.com/
