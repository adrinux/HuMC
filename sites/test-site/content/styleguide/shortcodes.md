---
title: "Hugo Shortcodes"
date: 2018-12-07T14:21:35Z
draft: false
type: "styleguide"
weight: 60
menu:
  styleguide
description: "Hugo shortcode examples and usage."
---

Hugo shortcodes with examples.

### Hugo built in Shortocdes

See Hugo [shortcodes docs](https://gohugo.io/content-management/shortcodes/) for full list. Here are the two most common.

----

#### figure

For full list of attributes see [Hugo docs](https://gohugo.io/content-management/shortcodes/#figure)

*This input:*

<code>
\{\{< figure src="/images/bluegreenchess.jpg"
    title="Chequered pattern in blue and green"
    width="300" alt="An absctract pattern" >\}\}
</code>

*Result:*

{{< figure src="/images/bluegreenchess.jpg" title="Chequered pattern in blue and green" width="300" alt="An absctract chequer pattern overlaid with blue and green triangle shapes and tilted away from the viewer at the top" >}}


----

#### param

