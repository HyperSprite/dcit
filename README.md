# DCIT is for Data Center Information Tracking

This undertaking was done purely on my own time because I could not stand to see years of work disappear.
Primarily, I built this because I could not find an application that worked in a way that I did. The applications I found were all based around the Equipment as the basis for all information about the whole of the configuration. The issue is the Equipment is commodity, if it breaks, you swap it and if all of your configuration data is attached to the Equipment, you have to move all of that data to the new Equipment.

##Goals

###1 Remove Excuses
Make it so easy to document changes that there is no excuse not to.

###2 Make the documentation create the configuration
Make documenting things on the front end save you time down the road. 
I originally wrote this using SalesForce, Google Sheets and Google App Script. That last iteration could configure bare metal console server configs including all device ports, switched PSU configs, cisco network ports and ipmi setup as well as create text for the tickets to send to hand the system off with all of the critical details (I admit creating the ticket automatically would have been the logical next step). 

Version 1 contains the ticket information and console port config for Avocent ACS 6000. These are fairly crude but I believe I have the framework set to make much more complicated System reports and scripts. For instance and ILOM setup script should be fairly straight forward considering I know the ilom MAC address, network information and the hardware.

###3 Availability
Anyone who may need the information should be able to find it quickly and easily without needing to call other people. Also, information should be easily exportable for local examination.

##How I got here
My Company was acquired and SalesForce and Google Apps were out. I had all of this painstakingly collected data and no place to put it. When I presented my issue to people in charge of the document migration, I just got silence. I don't think anyone had a clue as to the extent I was leveraging these technologies for day to day use. I was given a year and wasted the first six months trying to figure out if there was a canned solution. Finally I came to the conclusion, if I wanted this done, I had to do it myself.

I decided early on I wanted to use Node and MongoDB as the backend but really had no other plans. The choice for Node was made because it is modern and is based on javascript which always made more sense to me than anything else and my experience with Google App Script made me a believer in back end JS. 
MongoDB was chosen for the Document model. In the past, before I knew of document model databases, I tried laying this project out in a relational DB way. It quickly grew so large and complicated with tables and joins that made it difficult to even start the project. 

One thing I have consciously done, I am sure called hearrassy by database folks is lightly tie Equipment, Systems and Locations together. This came about because of the chicken and the egg issue of trying to build up racks from the ground up and having to add each thing in a particular order generally meant, someone would end up frustrated and not be able to figure out what order to add things.

So I picked up this book [Web Development With Node and Express, 1st Edition](http://shop.oreilly.com/product/0636920032977.do) and proceeded to use it as my base. It turns out as good as it is, it is more of a series of pamphlets on the process. Each chapter could use a book in its own right so much of the six months writing this was spent learning how to do things by scowering [Google](http://google.com) and [StackOverflow](http://stackoverflow.com/) looking for how to do what seemed like simple things all while the clock was ticking. I have learned so much that a total refactor is probably in order but as much as I hate the saying Great is the enemy of Good, my time has run out and it's good enough to ship. I just hope that my fundamental design and database model will stand up to the refactoring. 

## Installation

You need this git repository, a working Node v0.12.0 or above and MongoDB installed. Other than what the package.json installs, I only install PM2 for keeping it up and running. 