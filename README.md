## Note

This project is evolving from 'web-starter-hugo' which is on the git branch 'wsh-1.0'. It's a WIP and not recommeded for production use. Yet.

# HuMC

(aka Hugo Master Controller or Hugo Multisite Controller)

HuMC is:

- A set of tasks to help manage, develop and deploy a collection of web sites built with [Hugo]().
- A starter site for [Hugo]() (it may become several possible starter sites).
- A starter theme for [Hugo]() based on [HTML5 Biolerplate]() called Bunait
- Pronounced (in my head) as 'humsee'.


## Dependencies

HuMC uses the go-task task runner. Installation is detailed below.

The new-site task relies on sed, this works fine on Linux but some BSD based sed versions dont allow case insensitive search - AFAIK that includes OSX - so install gnu-sed uisng your favourite package manager (brew, macports, fink etc).

You'll need hugo of course. You'll need a hugo-extended version to have the PostCSS asset processing in Bunait work. I use dkebler's script detailed on the [Hugo discourse Forum](https://discourse.gohugo.io/t/script-to-install-latest-hugo-release-on-macos-and-ubuntu/14774/14) - note the script may need tweaked for your linux distro, read the discussion there.

```bash
wget https://download.kebler.net/hugo-update
chmod +x hugo-update
# Check the script contents before running it!
sudo mv hugo-update /usr/local/bin
sudo hugo-update
```

You'll also need nodejs installed for some asset processing.

The setup task will check if these are installed, with the exception of gnu-sed.


## Install & setup

Install the task runner [Task](https://taskfile.org/#/installation) by your chosen method. Here's an example using the install script to install task in /usr/local/bin:

```bash
wget https://taskfile.org/install.sh
chmod 700 install.sh
sudo ./install.sh -b /usr/local/bin
rm -rf install.sh
```

Clone HuMC from github.

Run setup tasks.

```bash
cd HuMC
task setup
```

Test HuMC.

```bash
cd starters/five-page
hugo serve
```

And visit http://localhost:1313 to check everything is working.


## Start a new site

From within the HuMC directory:

```bash
task new-site NAME=awesome
```

Will create a new site at 'sites/awsome' with a custom theme 'sites/awsome/theme/awsome' ready to go. It will also have run 'git init', 'git add .' and 'git commit'.

Add a git remote and push before you start work. (Would an automated git deploy setup make this redundant?)
You can use the 'all' flag to push all branches at once:

```bash
git remote add origin gitea@gitea.example.com:username/awesome.git
git push -u origin --all
```

To launch your new site and begin work change directory and launch Hugo serve:

```bash
cd sites/awesome
hugo serve
```

Then visit localhost:1313 in your browser as normal for Hugo.
