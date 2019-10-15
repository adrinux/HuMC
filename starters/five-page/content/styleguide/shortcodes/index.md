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

{{< figure src="https://via.placeholder.com/200/c9177e.png" title="Placeholder Image" alt="Hugo pink via.placeholder.com image">}}

<hr style="clear: both">

#### param

Param grabs values set in front page matter. [Param shortcode documentation](https://gohugo.io/content-management/shortcodes/#param)

This page's weight is set to: {{< param weight >}}.

----

### Shortcodes included with theme

These shortcodes are included with this theme.

----

#### Responsive Images with image srcset

MDN documentation for image [srcset](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images#Resolution_switching_Different_sizes).

Two available shortcodes, imgsrc requires externally generated resized images. img-auto-src will use Hugo's built in image processing to create the resized images.

##### imgsrc shortcode:

<textarea rows="8" cols="46">
{{</* imgsrc
  src="styleguide/example-mini.jpg"
  srcRoot="styleguide/example"
  alt="Description of example Photo"
  class="normal"
*/>}}
</textarea>

##### Example imgsrc output:

{{< imgsrc
  src="styleguide/example-mini.jpg"
  srcRoot="styleguide/example"
  alt="Description of example Photo"
  class="normal"
>}}

##### Files to edit when imgsrc needs change:

- themes/bunait/layouts/shortcodes/imgsrc.html
- themes/bunait/assets/css/styleguide.css
- content/styleguide/shortcodes.md (this page)

----

##### img-auto-src shortcode:

<textarea rows="8" cols="46">
{{</* img-auto-src
  src="example.jpg"
  alt="Description of example photo"
  class="normal"
  loadingAttribute="lazy"
  sizes="100vw"
*/>}}
</textarea>

##### Example img-auto-src output:

{{< img-auto-src
  src="example.jpg"
  alt="Description of example photo"
  class="normal"
  loadingAttribute="lazy"
  sizes="100vw"
>}}

##### Files to edit when img-auto-src needs change:

- themes/bunait/layouts/shortcodes/img-auto-src.html
- themes/bunait/assets/css/styleguide.css
- content/styleguide/shortcodes.md (this page)


----

#### Responsive Figure with image srcset

##### Example shortcode:

<textarea rows="4" cols="46">
{{</* figure-imgsrc src="styleguide/example"
  title="The optional figure title"
  caption="An optional caption for this test figure."
  class="responsive"
*/>}}
</textarea>

##### Example output:

{{< figure-imgsrc src="styleguide/example" title="The optional figure title" caption="An optional caption for this test figure." class="responsive" >}}

##### File to edit when this needs to change:

- themes/bunait/layouts/shortcodes/figure-imgsrc.html
- themes/bunait/assets/css/styleguide.css
- content/styleguide/shortcodes.md (this page)
