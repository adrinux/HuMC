#!/usr/bin/env bash

### .RSSLink is deprecated
# For an error/warning from Hugo like:
# "Page's .RSSLink is deprecated and will be removed in a future release. Use the Output Format's link, e.g. something like: 
#   {{ with .OutputFormats.Get "RSS" }}{{ .RelPermalink }}{{ end }}."


# find old style code:
# {{ if .RSSLink }}
# <link href="{{ .RSSLink }}" rel="alternate" type="application/rss+xml" title="{{ .Site.Title }}" />
# <link href="{{ .RSSLink }}" rel="feed" type="application/rss+xml" title="{{ .Site.Title }}" />
# {{ end }}

# Replace with new style:
# {{ with .OutputFormats.Get "rss" -}}
# {{ printf `<link rel="%s" type="%s" href="%s" title="%s" />` .Rel .MediaType.Type .Permalink $.Site.Title | safeHTML }}
# {{ end -}}


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
