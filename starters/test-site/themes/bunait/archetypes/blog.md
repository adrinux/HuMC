---
date: {{ .Date }}
publishdate: {{ now.Format "2006-01-02" }}
draft: true

type: "blog"

title: "{{ replace .TranslationBaseName "-" " " | title }}"
#slug: ""
description: ""
author: ""
tags: []
---


<!--more-->
