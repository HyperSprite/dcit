
# DCIT is for Data Center Information Tracking

I built DCIT because I wanted documenting data center life cycle to benefit the people doing the work.

##Goals

###1 Remove Excuses
Make it easy enough to document changes that there is no excuse not to.

###2 Make the documentation do work for you down the line
Make documenting things in the first place help you do things in the second place. The reason people don't follow through with documentation is that it always has the lowest priority. I tried to flip that on its head. By documenting things as you do them, the harder part of creating tickets and port configurations is made easier.

For instance, configuring a fresh out of the box Avocent Cyclades ACS 6000 from start to finish, no kickstarts, no DHCP, just a console connection and following the device specific instructions.

###3 Availability
A Sev 1 is not the time to have to try and figure out how things are configured in some remote location. Finding anything should be easy and once you find it, it should be easy to understand.

##Roadmap
There is a lot more to do with DCIT. For instance:

 - Building a modular system configuration for adding new device configs.
 -  Moving System views over to mongodb aggregate $lookup and getting more information with less fetches from the db.
 - Moving the front end to React/Redux, less server side rendering.
 - Project management module to keep track of new builds.
 - Small Parts inventory module to keep track on existing spare parts/cables and build BOMs for new build and replenishment.

## Installation
See the Wiki for installation instructions.

