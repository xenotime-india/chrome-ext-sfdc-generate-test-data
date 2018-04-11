String.prototype.trimEnd = function(c) {
    if (c)
        return this.replace(new RegExp(c.escapeRegExp() + "*$"), '');
    return this.replace(/\s+$/, '');
};
String.prototype.trimStart = function(c) {
    if (c)
        return this.replace(new RegExp("^" + c.escapeRegExp() + "*"), '');
    return this.replace(/^\s+/, '');
};

String.prototype.escapeRegExp = function() {
    return this.replace(/[.*+?^${}()|[\]\/\\]/g, "\\$0");
};

convertSFDC15To18 = function(sfdcID15){
    if (sfdcID15.length == 15) {
        var s = "";
        for (var i = 0; i < 3; i++) {
            var f = 0;
            for (var j = 0; j < 5; j++) {
                var c = sfdcID15.charAt(i * 5 + j);
                if (c >= "A" && c <= "Z")
                    f += 1 << j;
            }
            s += "ABCDEFGHIJKLMNOPQRSTUVWXYZ012345".charAt(f);
        }
        return sfdcID15 + s;
    } else {
        throw "Error : " + sfdcID15 + " has not a length of 15 characters. Current length detected: " + sfdcID15.length + " characters.";
    }
};

subStrAfterChars = function(str, char, pos) {
    if(pos=='b')
        return str.substring(str.indexOf(char) + 1);
    else if(pos=='a')
        return str.substring(0, str.indexOf(char));
    else
        return str;
};

getUrlEncodedKey = function(key, query) {
    if (!query)
        query = window.location.search;
    var re = new RegExp("[?|&]" + key + "=(.*?)&");
    var matches = re.exec(query + "&");
    if (!matches || matches.length < 2)
        return "";
    return decodeURIComponent(matches[1].replace("+", " "));
};
setUrlEncodedKey = function(key, value, query) {

    query = query || window.location.search;
    var q = query + "&";
    var re = new RegExp("[?|&]" + key + "=.*?&");
    if (!re.test(q))
        q += key + "=" + encodeURIComponent(value);
    else
        q = q.replace(re, "&" + key + "=" + encodeURIComponent(value) + "&");
    q = q.trimStart("&").trimEnd("&");
    return (q[0]=="?" ? q : q = "?" + q);
};

var getServerURL = function() {
  var url = window.location.href;
  var arr = url.split("/");
  return arr[0] + "//" + arr[2];
}

var __getCookie = function(c_name){
  var i,x,y,ARRcookies=document.cookie.split(";");
  for (i=0;i<ARRcookies.length;i++){
    x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
    y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
    x=x.replace(/^\s+|\s+$/g,"");
    if (x==c_name){
      return unescape(y);
    }
  }
}

var getObjectIdFromUri = function(e) {
  if (isBlank(e)) return null;
  var t = getParser(window.location.href);
  if (isBlank(t.pathname)) return null;
  var n = t.pathname.match(/\/[a-zA-Z0-9]{15,18}/);
  if (isBlank(n) || 0 == n.length) return null;
  var r = n[0].replace(new RegExp("/", "g"), "");
  return r
};

var getParser = function(e) {
  var t = document.createElement("a");
  return t.href = e, t
}

var isBlank = function(e) {
  return "undefined" == typeof e || null === e ? !0 : "string" == typeof e && ("undefined" === e || "null" === e || "" === e)
}

var escapeString = function(e) {
  return String(e).replace(/\r?\n/g, "\\n").replace(/\r?\t/g, "\\t").replace(/'/g, "'").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
};

var getColLable = function(e) {
  var t = jQuery(e).clone().children().remove().end().text();
  return isBlank(t) && (t = jQuery(e).children(":visible").first().clone().children().remove().end().text()), t
};

var getObjectValues = function() {
  var e = [];
  return jQuery("#bodyCell").find(".detailList").each(function() {
    jQuery(this).find(".labelCol").each(function() {
      var t = getColLable(this);
      if (!isBlank(t) && !isBlank(t.replace(/((\s*\S+)*)\s*/, "$1"))) {
        var n = jQuery(this).next("td").first(),
          r = n.text();
        r = escapeString(r);
        var i = {
          label: t,
          value: r
        };
        if (n.find("a").length > 0) {
          var o = n.find("a").first(),
            s = o.attr("href"),
            a = o.attr("id");
          if (!isBlank(s) && !isBlank(a) && a.indexOf("lookup") >= 0) {
            var c = o.get(0).pathname.replace(/\//g, "");
            i.reference = c
          }
        }
        if (n.find(".checkImg").length > 0) {
          var l = n.find(".checkImg").first().attr("src");
          i.value = !(l.indexOf("unchecked") >= 0)
        }
        e.push(i)
      }
    })
  }), e
}

var getFieldCode = function(e, t) {
  if (t.label !== e.label) return null;
  var n = t.type;
  if (isBlank(n)) return null;
  var r = n;
  if (isBlank(r)) return null;
  if ("Formula" == r || "Auto Number" == r) return null;
  var i = e.value;
  if (isBlank(i) && (i = " "), i = i.toString().rtrim(), isBlank(i)) return "null";
  if ("RecordType" == r) {
    if (i = i.replace(/\[(.*)\]/g, "").rtrim(), 0 == t.recordTypes.length) return null;
    for (var o = 0; o < t.recordTypes.length; o++) {
      var a = t.recordTypes[o];
      if (i == a.label) return "'" + a.id + "'"
    }
    return null
  }
  return "Currency" == r || "Number" == r || "Percent" == r ? (i = i.replace(/\,/g, "").replace(/\%/g, ""), getNumber(i)) : "Checkbox" == r ? 1 == i || "true" == i || 1 == i || "1" == i ? "true" : "false" : "Date" == r ? "Date.valueOf('" + i.replace(/\//g, "-") + "')" : "Date/Time" == r ? "Datetime.valueOf('" + i.replace(/\//g, "-") + ":00')" : "Master-Detail" == r || "Lookup" == r ? "'" + e.reference + "'" : "'" + punescape(i) + "'"
}

var punescape = function(e) {
  return String(e).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
}

var getNumber = function(e) {
  if (isBlank(e)) return null;
  var t = e.match(/([1-9]\d*|0)(\.\d+)?/g);
  return isBlank(t) ? null : t[0]
}

var getSpaceByNum = function(e) {
  for (var t = "", n = 0; e > n; n++) t += " ";
  return t
}

function showAlert(mess) {
    if (sfdcPage.dialogs['SFDCDialog'] == null) { // checking if SFDCDialog modal popup already created on page.

        sfdcPage.dialogs['SFDCDialog'] = new SimpleDialog('SFDCDialog', false); // creating modal popup with name ‘SFDCDialog’

        sfdcPage.dialogs['SFDCDialog'].title = "Salesforce Deployment Helper - Xenotime"; // setting title of popup

        sfdcPage.dialogs['SFDCDialog'].isMovable = false; //set true if want movable

        sfdcPage.dialogs['SFDCDialog'].displayX = true; // set true if want close button on header

        sfdcPage.dialogs['SFDCDialog'].extraClass = "" // use to set any extra style class if wanted

        sfdcPage.dialogs['SFDCDialog'].width = 346; // set size of popup default = 400

        sfdcPage.dialogs['SFDCDialog'].isModal = true; // set true if want block background.

        sfdcPage.dialogs['SFDCDialog'].createDialog(); // finally call this method to create modal pop up  and append to current page.

    }
    var message = '<table border="0"><tbody><tr><td style="vertical-align: top"><img src="/s.gif" class="confirmLarge" alt="Confirm"></td><td style="padding-left: 8px; vertical-align: top; line-height: 16px"><p>'+mess+'</p></td></tr></tbody></table>'
    sfdcPage.dialogs['SFDCDialog'].setContentInnerHTML('<div>' + message + '</div>');

    sfdcPage.dialogs['SFDCDialog'].show();// show modal popup
}

String.prototype.rtrim = function() {
  return this.replace(/((\s*\S+)*)\s*/, "$1")
};
String.prototype.ltrim = function() {
  return this.replace(/\s*((\S+\s*)*)/, "$1")
};
String.prototype.clearSpace = function() {
  return isBlank(this) ? this : this.replace(/\n/g, "").replace(/\t/g, "").replace(/ /g, "")
};