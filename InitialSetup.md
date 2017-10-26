Setting up a localhost server & testing our website
(not sure if you have a server? When you load the project on netbeans, the console will let you know)
1. Click on the services tab (its in the same window that displays the project directory)
2. Right click “servers”
3. follow the part of this tutorial that goes over how to create a glassfish server
    1. https://netbeans.org/kb/docs/web/quickstart-webapps-spring.html#setting
		(start on step 4)
	  2. set the domain name to EnergyHill, thats the only custom setting you need to know about
4. Under the projects tab, right click EnergyHill. Near the bottom of the dropdown menu is an item called "resolve missiong server issue"
   Click on it and Netbeans will open a window allowing you to select the glassfish server you just made
5. go to your browser and type in the URL box - localhost:8080/EnergyHill/index.htm
Running the project should do this for you automagically.


To stop the server:
1. Go to the services tab (its in the same window that displays the project directory).
2. Double click "Servers".
3. Right click GlassFish Server.
4. Select the "Stop" option.
