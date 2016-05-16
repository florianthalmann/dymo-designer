Dymo Designer
=====================

A web app for designing dynamic music objects.

## Installing

First install [Bower](http://bower.io/#install-bower) if you haven't yet:
```bash
$ npm install -g bower
```

Then clone the dymo-designer project to your computer:
```bash
$ git clone https://github.com/florianthalmann/dymo-designer.git
```

Go to the cloned project folder and run:
```bash
$ npm install
$ bower install
```

Now you can navigate to http://localhost:8080 in your browser to start the app.

## Generating Feature Files

Install [Sonic Annotator](http://www.vamp-plugins.org/sonic-annotator/) and any desired [Vamp plugins](http://www.vamp-plugins.org/download.html). Extract the features you are interested to JSON or RDF (N3) files using e.g.
```bash
$ sonic-annotator -d vamp:qm-vamp-plugins:qm-barbeattracker:beats input/example/example.mp3 -w json
```

## Creating Dymos from Feature Files

Gather all audio and feature files you want to use in your dymo in a custom subfolder of the `input` folder, e.g. `input/experience1/`. In Dymo Designer, go to the features tab and select your custom folder and import the features by clicking on the `Add Feature` button.

## Defining Interaction Schemes

## Exporting and Playing Back Dymos

You can play back the created dymos using the [Semantic Player](https://github.com/florianthalmann/semantic-player.git).
