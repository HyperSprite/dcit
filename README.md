![Massive machines, wheels of a steam locomotive](https://raw.githubusercontent.com/HyperSprite/dcit/master/public/img/jumbotron_bg.png)

# DCIT is for Data Center Information Tracking




DCIT is a DCIM (Data Center Information Management) system built because I wanted documenting the data center life cycle to be easy for the people entering the information and useful to the people who need it.

##Key Goals and Design Philosophy

###1 - Remove Excuses
Make it easy enough to document changes that there is no excuse not to.

To this end, DCIT is implemented with what I call **Responsible Flexibility**.
What is Responsible Flexibility and why should you care? In working with various tools, I have found most are overly rigid. An example: from a server, you can not plug a cable into a switch until it exists, you can't install the switch until the rack exists, etc. This makes total sense when designing the application, and in a perfect world, this should never happen. The problem is the world is not perfect. The moment the flow is broken, there is an opportunity for something to be forgotten. This is where I feel most inventory systems fail, and when I say "system", I am referring both to the tool and the people using it. *Responsible* people need to be given the *Flexibility* to enter the data they think is correct at the time they have it. DCIT will suggest possible responses in many places but not enforce them.

###2 - Make documenting easier than not documenting
How many times have you heard "*We will go back and document this later*", now ask yourself, how often does that really happen?
With DCIT, documenting things as you go will then output items such as port configuration requests for change management tickets and console and net management configuration scripts. See this [Avocent ACS](https://dcit.hypersprite.com/system/con-ny01-aa04-01) on the DCIT example site.

###3 - Availability
A Sev 1 is not the time to have to try and figure out how things are configured in some remote location. Finding anything should be easy and once you find it, it should be easy for anyone to understand.

###4 - Equipment and Systems are not the same thing
Most asset tracking systems I have seen combine Equipment and Systems. The problem is Equipment and Systems are two separate entities with separate life-cycles. For instance, lets say you have a System named [sf01-dock1001](https://dcit.hypersprite.com/system/sf01-dock1001) setup on Equipment [BZR297130](https://dcit.hypersprite.com/equipment/BZR297130) and BZR297130 needs to be removed for RMA and want to replace it with [BZR297383](https://dcit.hypersprite.com/equipment/BZR297383). In most systems, how would you do that? Would you have to re-enter all of equipment specific things, like ram, cpu, drives, line of business owner etc.? Would you have to re-enter all of the System specific things, like OS, software, and cabling information? Any time you have to re-enter things you have an opportunity for mistakes. With DCIT, you simply move the equipment into the proper location and change what Equipment the System is pointed to.

##Roadmap
There is a lot more to do with DCIT. For instance:

 - Fix bugs
 - Building a modular system configuration for adding new device configs. Right now this is hard coded in a way that won't scale but it is not so deep in the code that it can't be changed relatively easily.
 - System and Equipment change history.
 -  Moving System views over to mongodb aggregate $lookup and getting more information with less fetches from the db.
 - Moving the front end to React/Redux, less server side rendering.
 - Project management module to keep track of new builds.
 - Small Parts inventory module to keep track on existing spare parts/cables and build BOMs for new build and replenishment.

##Installation and Further Resources
See the [Wiki](https://github.com/HyperSprite/dcit/wiki) for installation instructions, Slack channel and other information.

##About Development

I wrote this because I have never seen asset management software that made sense from the point of view of the data center. Sure, I've seen software that will draw you great pictures and fancy maps but when it comes down to it, does it really work? Do people keep it up to date?

I also wanted something that could work from a phone. Everyone has a smartphone these days and being able to look up a system from anywhere is useful, especially when you are trying to explain to remote hands where your firewall is while on vacation without our wife finding out.

The software was originally based on the book "Web Development with Node & Express by [Ethan Brown](https://github.com/EthanRBrown/web-development-with-node-and-express). There is probably a little bit of that code left lurking in the shadows but probably not much, although the folder structure and route file was retained.

Somewhere along the way I stopped following the book and started building DCIT. As the sole developer, the work has been on my free time, nights and weekends since I began.

###Technologies
DCIT uses the following core technologies. Nodejs, Express, Mongodb, Mongoose, Handlebars, Boootstrap, jQuery, HTML and CSS.

For simplicity, the original app was strictly a server side rendering model. Slowly, AJAX has been added to various parts to make it more interactive and speed up the user interface but there is still a lot more to do.

