## Note

This project is evolving from 'web-starter-hugo' which is on the git branch 'wsh-1.0'. It's a WIP and not recommeded for production use. Yet.

# HuMC

(aka Hugo Master Controller or Hugo Multisite Controller)

HuMC is:

- A set of tasks to help manage, develop and deploy a collection of web sites built with [Hugo]().
- A starter site for [Hugo]() (it may become several possible starter sites).
- A starter theme for [Hugo]() based on [HTML5 Biolerplate]()
- Pronounced (in my head) as 'humsee'.


## Install & setup

Install the task runner [Task](https://taskfile.org/#/installation) by your chosen method. Here's an example using the install script to install task in /usr/local/bin:

```bash
wget https://taskfile.org/install.sh
chmod 700 install.sh
./install.sh -b /usr/local/bin
rm -rf install.sh

```

Clone HuMC from github.



Run setup tasks.

```bash
cd HuMC
task setup
```
