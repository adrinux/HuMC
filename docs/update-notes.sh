
# Handy update snippets

## hugo 55.1

### .Hugo to hugo
# "Page's .Hugo is deprecated and will be removed in a future release. Use the global hugo function"
find ./ -not -path '*/\.git*' -type f -readable -exec sed -i "s/.Hugo.Generator/hugo.Generator/g" {} \;