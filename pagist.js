
Pagist.MathExtractor = function() {
  var map = {}
    , nextID = 1
  function id(text) {
    for (;;) {
      var id = '$Math-' + nextID++ + '$'
      if (text.indexOf(id) == -1) return id
    }
  }
  return {
    extract: function(text) {
      return text.replace(/\\\([\s\S]+?\\\)|\$\$[\s\S]+?\$\$/g, function(a) {
        var r = id(text)
        map[r] = a
        return r
      })
    }
  , insert: function(text) {
      for (var i in map) {
        if (Object.prototype.hasOwnProperty.call(map, i)) {
          text = text.split(i).join(map[i])
        }
      }
      return text
    }
  }
}

Pagist.DEFAULT_LAYOUT = function(html) {
  return '<link href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/css/bootstrap-combined.min.css" rel="stylesheet">'
    + '<script src="http://code.jquery.com/jquery.min.js"><\/script>'
    + '<script src="//netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/js/bootstrap.min.js"><\/script>'
    + '<script src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"><\/script>'
    + '<style>div.container { max-width: 720px; margin-top: 16px } .footer { text-align: center; color: #999; margin: 64px 0 16px } .footer a { color: #888 }</style>'
    + '<div class="container">'
    +   html
    + '</div>'
    + '<div class="footer"><b>gist <a href="' + this.data.html_url + '">#' + this.data.id + '</a></b>'
    +   ' by <a href="https://github.com/' + this.data.user.login + '">' + this.data.user.login + '</a>'
    +   ' <a href="' + this.data.html_url + '#comments">&raquo; comments</a>'
    + '</div>'
}

Pagist.filetypes['.html'] = function(text) {
  return text
}

Pagist.filetypes['.css'] = function(text) {
  return '<style>' + text + '</style>'
}

Pagist.filetypes['.js'] = function(text) {
  return '<script>' + text + '</script>'
}

;(function() {

  var id = location.search.match(/^\?([^\/]+\/\w*|\w+)/)
    , endpoint

  if (!id) {
    location.href = 'https://github.com/pagist/pagist.github.com/'
    return
  }

  id = id[1]

  if (id.indexOf('/') == -1) {
    endpoint = 'https://api.github.com/gists/' + id
  } else {
    endpoint = 'http://' + id
  }

  window.handleGistData = function(res) {
    document.title = res.data.description
    var list = []
      , files = res.data.files
      , html = ''
    for (var i in files) {
      if (Object.prototype.hasOwnProperty.call(files, i)) {
        if (!files[i].filename) files[i].filename = ""
        list.push(files[i])
      }
    }
    list.sort(function(a, b) {
      return a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0
    })
    for (var i = 0; i < list.length; i ++) {
      var file = list[i]
        , suffix = file.filename.match(/\.\w+/)
      if (suffix && Pagist.filetypes[suffix[0]]) {
        html += Pagist.filetypes[suffix[0]].call(file, file.content)
      } else {
        html += '<p>Unknown file: ' + file.filename + '</p>'
      }
    }
    if (Pagist.layout == null) Pagist.layout = Pagist.DEFAULT_LAYOUT
    document.write(Pagist.layout.call(res, html))
  }

  document.write(
    '<script src="' + endpoint
  + '?callback=handleGistData&nocache=' + new Date().getTime() + '"><\/script>'
  )

})()
