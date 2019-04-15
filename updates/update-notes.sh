
# Handy update snippets

# This is not a shell script! It's a file of shell commands with 
# an .sh extension for syntax highlighting in your favourite editor 


## hugo 55.1

### .Hugo to hugo
# "Page's .Hugo is deprecated and will be removed in a future release. Use the global hugo function"
# Run this one liner:
find ./ -not -path '*/\.git*' -type f -readable -exec sed -i "s/hugo.Generator/hugo.Generator/g" {} \;


### .RSSLink is deprecated
# "Page's .RSSLink is deprecated and will be removed in a future release. Use the Output Format's link, e.g. something like: 
#   {{ with .OutputFormats.Get "RSS" }}{{ .RelPermalink }}{{ end }}."

# Assuming the problem site is in sites/
# In HuMC/sites directory run this script:
../updates/deprecated-RSSLink.sh
