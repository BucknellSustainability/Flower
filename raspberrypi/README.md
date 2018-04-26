

# Setting up the Pi

## Installing the NOOBS OS

You can find the lastest download for the NOOBS OS here: https://www.raspberrypi.org/downloads/noobs/

No special setup is required for this project; any installation of NOOBS
will work.

## Installing Libraries

This project uses the `pymysql` and `pyserial` libraries. To install these
libraries for use with `python3`, we use the `pip3` manager. Run these commands:
```
sudo apt-get install pip3
sudo pip3 pymysql pyserial
```

If a library is missing, the scripts will output an error message with
installation instructions.

## Command line / gui mode

### Boot into Command Line
To get the pi to boot into the command line:

1) sudo raspi-config
2) Go to Boot Options > Desktop/CLI > Console Autologin

### Boot into GUI Mode
To return it to GUI mode:

1) sudo raspi-config
2) Go to Boot Options > Desktop/CLI > Desktop Autologin

If you would like to continue with GUI Mode, the commands must be run in a terminal window.

### Security
If autologin is ever disabled, the credentials are:
- username: `pi`
- password: ``		(empty)

The login is not secret, because we are not trying to secure the pi. If a malicious user has physical access to the pi with a screen, then we have already lost, since the server.py file is unprotected.

## Fixing the Keyboard

The default NOOBS installation comes with a United Kingdom keyboard configuration. This switches some keys (such as `"` and `@`) that are critical for this setup process and coding in general. You can fix it through the GUI settings menu, but that isn't permanent! To fix it permanently:
1) `sudo raspi-config`
2) Select the Keyboard Setup menu.
3) Select the first entry for keyboards (usually generic 101 or something similar).
4) Scroll down and select `Other` to get to the Country menu.
5) Select `United States`
6) Select `English (US)` (You may have to scroll up to see it.)
7) `reboot`

## Setting up the Internet

Follow the instructions provided in the template `wpa_supplicant.conf` file.

## Download the Repository

From the home directory, use git to download this repository:

`git clone https://github.com/BucknellSustainability/Flower.git`

## Create the `config.json` File

Creating this file is covered elsewhere in this repo. The pi server requires the DB-related keys inside the config.

## Setting the timezone

To set the timezone to EST:

1) `sudo dpkg-reconfigure tzdata`
2) Select `America`
3) Scroll down and select `New York`
4) `reboot`

## Start-On-Boot
To setup a cron job to restart the server every reboot:
1) `crontab -e`
	Note: If it asks you for an editor, choose vim or nano.
2) Add the line `@reboot cd /home/pi/Flower/raspberrypi && python3 /home/pi/Flower/raspberrypi/server.py`
3) `reboot`

### Viewing Server that was Started via Boot
To see the status of the server, do:
1) `ps -A | grep py`
2) Note the Process ID of server.py (a.k.a. the `PID`). The `server.py` process is the only python process.
3) `sudo /proc/<PID>/fd/1 | tail -f` where `<PID>` is the Process ID of`server.py`
	Note: Use 1 to see stdout, use 0 to see stderr
	Note: The output is buffered. It can take some time for the output to update.
	Note: Currently, it only uses stdout. Nothing is printed to stderr.

# Troubleshooting the Server

	Error: "Can't connect to MySQL server on..."
	Fix: 
		The Pi has read the `config.json` file, but cannot connect to
		the database. Check your internet connection. If the internet
		conneciton is correct, check the connection credentials in the
	   	`config.json` file.

	Error: "[Errono 2] could not open port /dev/tty<whatever>..."
	Fix: 
		The Pi knows an arduino is plugged in, but cannot read data from
		it. This can happen if the USB connection has some dust in it;
		try unplugging it and blowing it off. It can also happen if two
		copies of the server process are running. Run `ps -A | grep py`;
		there should only ever be one instance of `python3`. If there are
		more, type `kill -s TERM <PID>`, where `PID` is the number listed
		next to the python instance in the `ps` response. Generally, you
		will want to kill the instance with the lowest `pid`.	
	Error: The arduino definitely outputs stuff, but the pi doesn't see any output!
		Check the baud rate of the arduino. The server expects input at
		115200 baud. This corresponds to a `Serial.begin(115200)` line in
		the arduino `setup()` function. By default, arduinos use 9600 baud.
		Normally, when there is a baud rate mismatch, stuff looks like
		gibberish. However, when 9600 baud is sent to 115200 baud, it looks
		like nothing is sent. This is easily fixed by adding the
		`Serial.begin(115200)` line to your arduino program.
	
# Design




