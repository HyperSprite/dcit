![Massive machines, wheels of a steam locomotive](https://raw.githubusercontent.com/HyperSprite/dcit/master/public/img/jumbotron_bg.png)

# DCIT is for Data Center Information Tracking




DCIT is a Data Center Information Management system built because I wanted documenting the data center life cycle to not be a burden to the people doing the work and easy enough to use that someone unfamiliar with the data center can still find the information they are looking for.

##Goals

###1 Remove Excuses
Make it easy enough to document changes that there is no excuse not to.

###2 Make the documentation do work for you down the line
Make documenting things in the first place help you do things in the second place. The reason people don't follow through with documentation is that it always has the lowest priority. I tried to flip that on its head. By documenting things as you do them, the harder part of creating tickets and port configurations is made easier.

For instance, configuring a fresh out of the box Avocent Cyclades ACS 6000 from start to finish, no kickstarts, no DHCP, just a console connection and following the device specific instructions.

###3 Availability
A Sev 1 is not the time to have to try and figure out how things are configured in some remote location. Finding anything should be easy and once you find it, it should be easy to understand. For instance, if you use serial numbers for your cables, and collect them in DCIT, having to replace a fully populated 48 port copper switch is actually easy.

##Roadmap
There is a lot more to do with DCIT. For instance:

 - Fix bugs
 - Building a modular system configuration for adding new device configs. Right now this is hard coded in a way that won't scale but it is not so deep in the code that it can't be changed relatively easily.
 -  Moving System views over to mongodb aggregate $lookup and getting more information with less fetches from the db.
 - Moving the front end to React/Redux, less server side rendering.
 - Project management module to keep track of new builds.
 - Small Parts inventory module to keep track on existing spare parts/cables and build BOMs for new build and replenishment.

##Installation
See the [Wiki](https://github.com/HyperSprite/dcit/wiki) for installation instructions.

##About Development

I wrote this because I have never seen asset management software that made sense from the point of view of the data center. Sure, I've seen software that will draw you great pictures and fancy maps but when it comes down to it, does it really work? Do people keep it up to date?

I also wanted something that could work from a phone. Everyone has a smartphone these days and being able to look up a system from anywhere is useful, especially when you are trying to explain to remote hands where your firewall is while on vacation without our wife finding out.

The software was originally based on the book "Web Development with Node & Express by [Ethan Brown](https://github.com/EthanRBrown/web-development-with-node-and-express). There is probably a little bit of that code left lurking in the shadows but probably not much, although the folder structure and route file was retained.

Somewhere along the way I stopped following the book and started building DCIT. As the sole developer, the work has been on my free time, nights and weekends since I began.

###Technologies
DCIT uses the following core technologies. Nodejs, Express, Mongodb, Mongoose, Handlebars, Boootstrap, jQuery, HTML and CSS.

For simplicity, the original app was strictly a server side rendering model. Slowly, AJAX has been added to various parts to make it more interactive and speed up the user interface but there is still a lot more to do.

