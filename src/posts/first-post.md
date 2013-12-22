Title: Install Zabbix on SmartOS
Date: 2013-04-07 01:05
Author: Benjamin Gentil
Category: Uncategorized
Tags: zabbix, smartos, sysadmin, monitoring, virtualization

Edit 22 June 2013: A dataset in now available on [http://datasets.at/](http://datasets.at/#!/configure/41c2c580-9f46-11e2-8897-0371573dbe1e)

Zone Creation
=============

Get the base64 image

	
	[root@smartos01 ~]# imgadm update
	[root@smartos01 ~]# imgadm avail|grep base64
	d0eebb8e-c9cb-11e1-8762-2f01c4acd80d  base64         1.7.0    smartos  2012-07-10T18:32:21Z
	8da4bc54-d77f-11e1-8f6f-cfe8e7177a23  base64         1.7.1    smartos  2012-07-27T00:19:33Z
	e8c41d40-f161-11e1-b839-a3631c115653  base64         1.7.2    smartos  2012-08-28T22:51:39Z
	60a3b1fa-0674-11e2-abf5-cb82934a8e24  base64         1.8.1    smartos  2012-09-25T07:14:50Z
	aa583f78-3d83-11e2-9188-fff9b605718d  base64         1.8.2    smartos  2012-12-03T21:30:53Z
	fdea06b0-3f24-11e2-ac50-0b645575ce9d  base64         1.8.4    smartos  2012-12-05T21:59:37Z
	bad2face-8738-11e2-ac72-0378d02f84de  base64         1.9.0    smartos  2013-03-07T15:14:30Z
	cf7e2f40-9276-11e2-af9a-0bad2233fb0b  base64         1.9.1    smartos  2013-03-22T17:11:29Z
	[root@smartos01 ~]# imgadm import cf7e2f40-9276-11e2-af9a-0bad2233fb0b 
	Importing image cf7e2f40-9276-11e2-af9a-0bad2233fb0b (base64 1.9.1) from "https://images.joyent.com"
	100% [=============================]  time 91.7s  eta 0.0s
	Imported image cf7e2f40-9276-11e2-af9a-0bad2233fb0b to "zones/cf7e2f40-9276-11e2-af9a-0bad2233fb0b".

Create the zone

	
	[root@smartos01 /opt]# cat zabbix.json 
	{
	  "brand": "joyent", 
	  "dataset_uuid": "cf7e2f40-9276-11e2-af9a-0bad2233fb0b",
	  "autoboot": true,
	  "alias": "zabbix",
	  "hostname": "zabbix",
	  "dns_domain": "local",
	  "resolvers": [
	    "8.8.8.8",
	    "8.8.4.4"
	  ],
	  "max_physical_memory": 1024,
	  "max_swap": 2048,
	  "nics": [
	    {
	      "nic_tag": "vswitch0",
	      "ip": "10.0.0.5",
	      "netmask": "255.0.0.0",
	      "gateway": "10.0.0.1"
	    }
	  ]
	}
	[root@smartos01 /opt]# vmadm create -f zabbix.json 
	Successfully created 6a63d970-fecf-407a-a651-9726d3d91784

Requirements Installation
=========================

Install apache, mysql, php, required php modules, libssh, net-snmp, gcc & gmake 

	
	[root@smartos01 /opt]# zlogin 6a63d970-fecf-407a-a651-9726d3d91784 
	[Connected to zone '6a63d970-fecf-407a-a651-9726d3d91784' pts/2]
	   __        .                   .
	 _|  |_      | .-. .  . .-. :--. |-
	|_    _|     ;|   ||  |(.-' |  | |
	  |__|   `--'  `-' `;-| `-' '  ' `-'
			   /  ; SmartMachine (base64 1.9.1)
			   `-'  http://wiki.joyent.com/jpc2/SmartMachine+Base

	[root@zabbix ~]# pkgin up
	pkg_summary.bz2                                                                                                                                                                                  100%  338KB 338.1KB/s  45.1KB/s   00:01    
	processing remote summary (http://pkgsrc.joyent.com/packages/SmartOS/2012Q4/x86_64/All)...
	updating database: 100%
	[root@zabbix ~]# pkgin in mysql-server-5.5.28 apache-2.4.4 php-5.4.9 ap24-php54-5.4.9 php54-gd-5.4.9 php54-mysql-5.4.9 php54-bcmath-5.4.9 php54-sockets-5.4.9 php54-mbstring-5.4.9 php54-gettext-5.4.9 libssh2-1.2.2nb1 net-snmp-5.6.1.1nb5 gcc47-4.7.2 gmake
	calculating dependencies... done.

	nothing to upgrade.
	24 packages to be installed: libuuid-2.19.1 expat-2.1.0 apr-util-1.4.1nb2 apr-1.4.6 xmlcatmgr-2.2nb1 mysql-client-5.5.28nb2 php-5.4.9 libxml2-2.9.0nb1 apache-2.4.4 png-1.5.13 jpeg-8d freetype2-2.4.11 binutils-2.22nb1 mysql-server-5.5.28 ap24-php54-5.4.9 php54-gd-5.4.9 php54-mysql-5.4.9 php54-bcmath-5.4.9 php54-sockets-5.4.9 php54-mbstring-5.4.9 php54-gettext-5.4.9 net-snmp-5.6.1.1nb5 gcc47-4.7.2 gmake-3.82nb5 (204M to download, 760M to install)

	proceed ? [Y/n] y

Zabbix Package
==============

wget the latest zabbix package:

	
	[root@zabbix ~]# wget "http://downloads.sourceforge.net/project/zabbix/ZABBIX%20Latest%20Stable/2.0.5/zabbix-2.0.5.tar.gz?r=http%3A%2F%2Fwww.zabbix.com%2Fdownload.php&ts=1365290649&use_mirror=kent"
	--2013-04-07 21:30:15--  http://downloads.sourceforge.net/project/zabbix/ZABBIX%20Latest%20Stable/2.0.5/zabbix-2.0.5.tar.gz?r=http%3A%2F%2Fwww.zabbix.com%2Fdownload.php&ts=1365290649&use_mirror=kent
	libidn: warning: libiconv not installed, cannot convert data to UTF-8
	Resolving downloads.sourceforge.net (downloads.sourceforge.net)... 216.34.181.59
	libidn: warning: libiconv not installed, cannot convert data to UTF-8
	Connecting to downloads.sourceforge.net (downloads.sourceforge.net)|216.34.181.59|:80... connected.
	HTTP request sent, awaiting response... 302 Found
	Location: http://kent.dl.sourceforge.net/project/zabbix/ZABBIX%20Latest%20Stable/2.0.5/zabbix-2.0.5.tar.gz [following]
	--2013-04-07 21:30:15--  http://kent.dl.sourceforge.net/project/zabbix/ZABBIX%20Latest%20Stable/2.0.5/zabbix-2.0.5.tar.gz
	libidn: warning: libiconv not installed, cannot convert data to UTF-8
	Resolving kent.dl.sourceforge.net (kent.dl.sourceforge.net)... 212.219.56.185
	libidn: warning: libiconv not installed, cannot convert data to UTF-8
	Connecting to kent.dl.sourceforge.net (kent.dl.sourceforge.net)|212.219.56.185|:80... connected.
	HTTP request sent, awaiting response... 200 OK
	Length: 13352744 (13M) [application/x-gzip]
	Saving to: `zabbix-2.0.5.tar.gz'

	100%[===================================================================================================================================================================================================>] 13,352,744  2.80M/s   in 4.2s    

	2013-04-07 21:30:19 (3.05 MB/s) - `zabbix-2.0.5.tar.gz' saved [13352744/13352744]

	[root@zabbix ~]# tar zxvf zabbix-2.0.5.tar.gz 


Zabbix Installation
===================

Change the configure files as follow, otherwise it won't find iconv & libssh (pkgin installs those libs in /opt/local not in /usr/local)

	
	[root@zabbix ~]# cd zabbix-2.0.5
	[root@zabbix ~/zabbix-2.0.5]# vi configure

**iconv** (line 10789)

	
	# if test -n "$_iconv_dir_set" -o -f /usr/include/iconv.h; then
	#   found_iconv="yes"
	# elif test -f /usr/local/include/iconv.h; then
	if test -f /opt/local/include/iconv.h; then
	    ICONV_CFLAGS="-I/opt/local/include"
	    ICONV_LDFLAGS="-L/opt/local/lib"
	    found_iconv="yes"
	  else
	    found_iconv="no"
	    { $as_echo "$as_me:${as_lineno-$LINENO}: result: no" >&5
	$as_echo "no" >&6; }
	  fi

**libssh2** (line 10200)

	
	elif test -f /opt/local/include/libssh2.h; then
	 SSH2_CFLAGS=-I/opt/local/include
	 SSH2_LDFLAGS=-L/opt/local/lib
	 SSH2_LIBS="-lssh2"
	 found_ssh2="yes"

	# Zabbix minimal major supported version of libssh2:
	minimal_libssh2_major_version=1

	# get the major version
	found_ssh2_version_major=`cat /opt/local/include/libssh2.h | $EGREP \#define.*LIBSSH2_VERSION_MAJOR | $AWK '{print $3;}'`

	accept_ssh2_version="no"

	if test $found_ssh2_version_major -ge $minimal_libssh2_major_version; then
	accept_ssh2_version="yes"
	fi;



Run **./configure --enable-server --enable-agent --with-mysql --enable-ipv6 --with-net-snmp --with-libcurl --with-ssh2**, it should en with this screen:

	Configuration:

	  Detected OS:           solaris2.11
	  Install path:          /usr/local
	  Compilation arch:      solaris

	  Compiler:              gcc
	  Compiler flags:        -g -O2  -I/opt/local/include/mysql -DUSE_OLD_FUNCTIONS -fPIC -DPIC -DHAVE_CURSES_H -I/opt/local/include  -I/opt/local/include/ncurses  -g -DNDEBUG       -I/opt/local/include -I/opt/local/include -I. -I/opt/local/include  -I/opt/local/include   -I/opt/local/include

	  Enable server:         yes
	  Server details:
	    With database:         MySQL
	    WEB Monitoring via:    cURL
	    Native Jabber:         no
	    SNMP:                  net-snmp
	    IPMI:                  no
	    SSH:                   yes
	    ODBC:                  no
	    Linker flags:          -rdynamic  -L/opt/local/lib    -L/opt/local/lib      -L/opt/local/lib  -L/opt/local/lib -L/opt/local/lib  -L/opt/local/lib -L/opt/local/lib -L/opt/local/lib  
	    Libraries:             -lkvm -lm -lnsl -lkstat -lsocket  -lresolv -liconv   -lmysqlclient       -lcurl -lidn -lssh2 -lssl -lcrypto -lsocket -lumem -lnsl -lz -lssh2 -lumem  -lnsl -lsocket -lnetsnmp -lelf -lumem -lkstat -lcrypto  -lnsl -lsocket -lnetsnmp -lelf -lumem -lkstat -lcrypto -lssh2  

	  Enable proxy:          no

	  Enable agent:          yes
	  Agent details:
	    Linker flags:          -rdynamic  -L/opt/local/lib   -L/opt/local/lib 
	    Libraries:             -lkvm -lm -lnsl -lkstat -lsocket  -lresolv -liconv   -lcurl -lidn -lssh2 -lssl -lcrypto -lsocket -lumem -lnsl -lz -lssh2 -lumem 

	  Enable Java gateway:   no

	  LDAP support:          no
	  IPv6 support:          yes

	***********************************************************
	*            Now run 'make install'                       *
	*                                                         *
	*            Thank you for using Zabbix!                  *
	*              <http://www.zabbix.com>                    *
	***********************************************************


Run **make install**

MySQL Configuration
===================

Configure the root password and remove useless users/dbs

	
	[root@zabbix ~/zabbix-2.0.5]# svcadm enable mysql
	[root@zabbix ~/zabbix-2.0.5]# mysql_secure_installation

	NOTE: RUNNING ALL PARTS OF THIS SCRIPT IS RECOMMENDED FOR ALL MySQL
	      SERVERS IN PRODUCTION USE!  PLEASE READ EACH STEP CAREFULLY!


	In order to log into MySQL to secure it, we'll need the current
	password for the root user.  If you've just installed MySQL, and
	you haven't set the root password yet, the password will be blank,
	so you should just press enter here.

	Enter current password for root (enter for none): 
	OK, successfully used password, moving on...

	Setting the root password ensures that nobody can log into the MySQL
	root user without the proper authorisation.

	Set root password? [Y/n] y
	New password: 
	Re-enter new password: 
	Password updated successfully!
	Reloading privilege tables..
	 ... Success!


	By default, a MySQL installation has an anonymous user, allowing anyone
	to log into MySQL without having to have a user account created for
	them.  This is intended only for testing, and to make the installation
	go a bit smoother.  You should remove them before moving into a
	production environment.

	Remove anonymous users? [Y/n] y
	 ... Success!

	Normally, root should only be allowed to connect from 'localhost'.  This
	ensures that someone cannot guess at the root password from the network.

	Disallow root login remotely? [Y/n] y
	 ... Success!

	By default, MySQL comes with a database named 'test' that anyone can
	access.  This is also intended only for testing, and should be removed
	before moving into a production environment.

	Remove test database and access to it? [Y/n] y
	 - Dropping test database...
	 ... Success!
	 - Removing privileges on test database...
	 ... Success!

	Reloading the privilege tables will ensure that all changes made so far
	will take effect immediately.

	Reload privilege tables now? [Y/n] y
	 ... Success!

	Cleaning up...



	All done!  If you've completed all of the above steps, your MySQL
	installation should now be secure.

	Thanks for using MySQL!

Create the database and import the initial data:

	
	[root@zabbix ~/zabbix-2.0.5]# echo "create database zabbix character set utf8;"|mysql -uroot -p 
	Enter password: 
	[root@zabbix ~/zabbix-2.0.5]# mysql -uroot -p zabbix < database/mysql/schema.sql 
	Enter password: 
	[root@zabbix ~/zabbix-2.0.5]# mysql -uroot -p zabbix < database/mysql/images.sql
	Enter password: 
	[root@zabbix ~/zabbix-2.0.5]# mysql -uroot -p zabbix < database/mysql/data.sql
	Enter password: 

PHP Configuration
=================

Edit the php.ini

	[root@zabbix ~/zabbix-2.0.5]# vi /opt/local/etc/php.ini

Configure the timezone

	date.timezone = Europe/Paris

Change these values to fit the zabbix requirements:

	max_execution_time = 300
	max_input_time = 300
	post_max_size = 16M

Add the php extentions in the "Dynamic Extensions" section

	extension_dir="/opt/local/lib/php/20120301"
 
	extension=bcmath.so
	extension=mbstring.so
	extension=gd.so
	extension=sockets.so
	extension=gettext.so
	extension=mysql.so

Configure Apache
================

Edit the httpd.conf

	
	[root@zabbix ~/zabbix-2.0.5]# vi /opt/local/etc/httpd/httpd.conf 

Add the php module

	LoadModule php5_module lib/httpd/mod_php5.so

Point index to index.php

	<IfModule dir_module>
	    DirectoryIndex index.html
	    DirectoryIndex index.php
	</IfModule>

Add the php mime type

	<IfModule mime_module>
		AddHandler application/x-httpd-php .php

Configure Zabbix
================

Copy the php files in htdocs:
	
	cp -r /root/zabbix-2.0.5/frontends/php /opt/local/share/httpd/htdocs/zabbix

Configure the DB Parameters in /usr/local/etc/zabbix_server.conf (mostly DBPassword)

	[root@zabbix ~/zabbix-2.0.5]# vi /usr/local/etc/zabbix_server.conf

Add the Zabbix user:

	[root@zabbix ~/zabbix-2.0.5]# groupadd zabbix
	[root@zabbix ~/zabbix-2.0.5]# useradd -g zabbix zabbix

Start all and finish the configuration via the GUI
==================================================

Start zabbix agent and server:

	[root@zabbix ~/zabbix-2.0.5]# LD_LIBRARY_PATH=/opt/local/lib /usr/local/sbin/zabbix_agentd
	[root@zabbix ~/zabbix-2.0.5]# LD_LIBRARY_PATH=/opt/local/lib /usr/local/sbin/zabbix_server	

Start apache:

	[root@zabbix ~/zabbix-2.0.5]# svcadm enable apache

Add the write rights on Zabbix conf directory

	chmod -R a+w /opt/local/share/httpd/htdocs/zabbix/conf

Open the web GUI (http://10.0.0.5/zabbix/), Next, Next, Next, Next, Next, Finish and login as **admin/zabbix**

![zabbix1](http://blog.bgentil.fr/theme/uploads/zabbix1_320x240.png)
![zabbix2](http://blog.bgentil.fr/theme/uploads/zabbix2_320x240.png)
![zabbix3](http://blog.bgentil.fr/theme/uploads/zabbix3_320x240.png)
![zabbix4](http://blog.bgentil.fr/theme/uploads/zabbix4_320x240.png)
![zabbix5](http://blog.bgentil.fr/theme/uploads/zabbix5_320x240.png)
![zabbix6](http://blog.bgentil.fr/theme/uploads/zabbix6_320x240.png)
![zabbix7](http://blog.bgentil.fr/theme/uploads/zabbix7_320x240.png)
![zabbix8](http://blog.bgentil.fr/theme/uploads/zabbix8_320x240.png)