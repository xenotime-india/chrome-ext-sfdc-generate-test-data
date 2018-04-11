$(function () {

  chrome.tabs.query({
    active: !0,
    currentWindow: !0
  }, function(e) {
    if (!isBlank(e[0])) {
      var t = getParser(e[0].url);
      var re = /.com\/(\w{15})/g;
      var match = re.exec(e[0].url);
      if (t.hostname.indexOf("salesforce.com") >= 0 && match) {
        return callPage({mode : "GET_METADATA"});
      }
      else {
        jQuery('#some-code').html('\n\nIt looks like you are opening me on a \nnon-Salesforce.com domain or non-sobject detail page...\n\n\n:-(');
        jQuery('.holder').hide();
      }
    }
  });

  chrome.runtime.onMessage.addListener(function(e, t, n) {
    if(e.status == 200) {
      if (e.action == 'GET_METADATA') {
        makeApexCode({fields: e.fields, values: e.values, sobject: e.sobject });
      }
    }
  })
});

var callPage = function(data) {
  chrome.tabs.query({
    active: !0,
    currentWindow: !0
  }, function(tab) {
    if (0 != tab.length) {
      try {
        chrome.tabs.executeScript(tab[0].id, {
          code: "var data = " + JSON.stringify(data) + ";"
        }, function () {
          chrome.tabs.executeScript(tab[0].id, {
            file: 'scripts/inlineExecute.min.js'
          }, function() {
          })
        })
      } catch (ex) {
        return {error: ex};
      }
    }
  })
}

var makeApexCode = function(e) {
  var fields = {};
  e.fields.forEach(function(element) {
    var data  = {};
    data[element.name] = { label: element.label, type:element.type  };
    fields : Object.assign(fields,data);
  });
  var values = e.values;
  if (isBlank(fields)) return showCustomDomain({
    error: !0
  });
  var r = getObjectIdFromUri(window.location.href),
    i = e.sobject.name;
  if (isBlank(i)) return alert("sObject ERROR!");
  for (var o = i + " sobj = new " + i + "(", a = o, s = [], l = [], c = 0, u = 0, d = 0; d < values.length; d++) {
    var f = values[d],
      p = f.value;
    isBlank(p) && (p = " "), p = p.toString().rtrim();
    for (var h in fields)
      if ("CreatedBy" != h && "LastModifiedBy" != h && "Owner" != h) {
        var g = fields[h];
        var m = getFieldCode(f, g);
        if (null != m) {
          var v = "\n  " + h + " = " + m;
          isBlank(p) || u++;

          s.push({
            code: v,
            isBlank: isBlank(p)
          });
          l.push("// " + f.label);
          c = v.length > c ? v.length : c
        }
      }
  }
  for (var y = 0, d = 0; d < s.length; d++) {
    var b = s[d],
      v = b.code,
      x = getSpaceByNum(c - v.length),
      w = 0 == d ? "" : "  ";
    if (!b.isBlank) {
      y++;
      var T = y == u ? "" : ",";
      o += v + T + w + x + l[d]
    }
    var T = d == s.length - 1 ? "" : ",";
    a += v + T + w + x + l[d]
  }
  o += "\n);\ninsert sobj;", a += "\n);\ninsert sobj;";
  jQuery('#some-code').html(o);
  Prism.highlightElement(jQuery('#some-code')[0]);
  jQuery('.holder').hide();
}