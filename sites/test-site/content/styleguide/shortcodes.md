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

Hugo shortcode example output. View <code>test-site/content/styleguide/shortcodes.md</code> to see the code used.


### Hugo built in Shortocdes

See Hugo [shortcode documentation](https://gohugo.io/content-management/shortcodes/) for full list. Here are two common shortcodes.

----

#### figure

HTML Figure element with caption. For full list of attributes see [Figure shortcode documentation](https://gohugo.io/content-management/shortcodes/#figure).

{{< figure src="https://via.placeholder.com/200/c9177e.png" title="Placeholder Image" width="300" alt="Hugo pink via.placeholder.com image" >}}

----

#### param

Param grabs values set in front page matter. [Param shortcode documentation](https://gohugo.io/content-management/shortcodes/#param)

This page's weight is set to: {{< param weight >}}.

----

### Shortcodes included with theme

(Hunt out some popular shortcodes, or those we've used.)

- picture
- img srcset
- others?
