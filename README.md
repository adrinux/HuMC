## Note

This project is evolving from 'web-starter-hugo' which is on the git branch 'wsh-1.0'. It's a WIP and not recommeded for production use. Yet.

# HuMC

(aka Hugo Master Controller or Hugo Multisite Controller)

HuMC is:

- A script, 'hum' to help manage, develop and deploy a collection of web sites built with [Hugo]().
- A starter site for [Hugo]() (it may become several possible starter sites).
- A starter theme for [Hugo]() based on [HTML5 Biolerplate]() called Bunait

In my head I pronounce HuMC as 'hum'.


## Dependencies

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

Clone HuMC from github.

Run setup task.

```bash
cd HuMC
./hum setup
```

Test HuMC.

```bash
cd starters/five-page
hugo serve
```

And visit http://localhost:1313 to check everything is working.
Use 'ctrl-c' to quit server.


## Start a new site

From within the HuMC directory run 'hum --new-site SITENAME' e.g. for a site named 'awesome' do:

```bash
./hum --new-site awesome
```

Or using the short cli flag:

```bash
./hum -n awesome
```

This will create a new site at 'sites/awesome' with a custom theme 'sites/awesome/theme/awesome' ready to go. It will also have run 'git init', 'git add .' and 'git commit'.

(Optional, but wise) Next add a git remote and push the starter code before you begin work. (An automated git deploy setup might make this redundant in future.)
You can use the '--all' flag to push all branches at once:

```bash
cd sites/awesome
git remote add origin gitea@gitea.example.com:username/awesome.git
git push -u origin --all
```

To view your new site and begin work change directory and launch Hugo's built in server:

```bash
cd sites/awesome
hugo serve
```

Then visit localhost:1313 in your browser as normal for Hugo.


## Workflow

### Development

### Content editing

### Deployment to Staging

### Deployment to production