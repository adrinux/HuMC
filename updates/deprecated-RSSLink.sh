#!/usr/bin/env bash


#find_text='{{ if .RSSLink }}
# <link href="{{ .RSSLink }}" rel="alternate" type="application/rss+xml" title="{{ .Site.Title }}" />
# <link href="{{ .RSSLink }}" rel="feed" type="application/rss+xml" title="{{ .Site.Title }}" />
# {{ end }}'

# replacement_text='{{ with .OutputFormats.Get "rss" -}}
# {{ printf `<link rel="%s" type="%s" href="%s" title="%s" />` .Rel .MediaType.Type .Permalink $.Site.Title | safeHTML }}
# {{ end -}}'


themes_with_rsslink=$(grep -lr "if .RSSLink")

# run npm i in those folders
for file in ${themes_with_rsslink}
do
(
  echo "Replacing RSSLink..."
  sed -i -e '/{{ if .RSSLink }}/,/{{ end }}/c\
{{ with .OutputFormats.Get "rss" -}}\
{{ printf `<link rel="%s" type="%s" href="%s" title="%s" />` .Rel .MediaType.Type .Permalink $.Site.Title | safeHTML }}\
{{ end -}}' ${file}
  echo "Finished replace in ${file}"
  echo "---}"
)
done





### .RSSLink is deprecated
# "Page's .RSSLink is deprecated and will be removed in a future release. Use the Output Format's link, e.g. something like: 
#   {{ with .OutputFormats.Get "RSS" }}{{ .RelPermalink }}{{ end }}."

# gawk ‘/start/{f=1;print;while (getline < “deprecated-RSSLink.txt”){print}}/end/{f=0}!f’ filetochange

#grep --null -lr "if .RSSLink" | xargs --null sed -i '/{{ if .RSSLink }}/,/{{ end }}/' 's/old_string/new_string/g'

#grep --line-buffered --null -lr "if .RSSLink" | xargs --null gawk ‘/\{\{ if .RSSLink \}\}/{f=1;print;while (getline < “/home/adrian/Admin/HuMC/updates/deprecated-RSSLink.txt”){print}}/\{\{ end \}\}/{f=0}!f’

#grep --line-buffered -lr "if .RSSLink" | xargs gawk ‘/\{\{ if .RSSLink \}\}/{f=1;print;while (getline < “/home/adrian/Admin/HuMC/updates/deprecated-RSSLink.txt”){print}}/\{\{ end \}\}/{f=0}!f’







