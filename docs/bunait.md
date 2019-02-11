

## Using Pagination

<code><pre>
{{ $paginator := .Paginate (where .Data.Pages "Type" "styleguide") 2 }}

{{ range $paginator.Pages }}
  <div class="post">
    <a href="{{ .Permalink }}">{{ .Title }}</a>
  </div>
{{ end }}

{{- partial "pagination.html" . -}}
</pre></code>
