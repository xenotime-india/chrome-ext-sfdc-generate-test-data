var T_DATA = data || {};

if ("GET_METADATA" == T_DATA.mode) {
  var re = /.com\/(\w{15})/g;
  var match = re.exec(window.location.href);
  debugger;
  if(match) {
    var recordId = match[1];
    var sforce = new jsforce.Connection({
      serverUrl : getServerURL(),
      sessionId : __getCookie('sid')
    });
    var sobject = {};
    sforce.describeGlobal().then(function(res) {
      return res.sobjects.find(function (item) {
        return item.keyPrefix == recordId.substring(0, 3);
      });
    }).then(function (currentSobject) {
      sobject = currentSobject;
      return sforce.sobject(currentSobject.name).describe();
    }).then(function (result) {
      return  { values: getObjectValues(), fields : result.fields };
    }).then(function (result) {
      chrome.runtime.sendMessage({
        action: T_DATA.mode,
        fields: result.fields,
        values: result.values,
        sobject: sobject,
        status: 200
      })
    }).catch(function (err)  {
      chrome.runtime.sendMessage({
        action: T_DATA.mode,
        status: 401,
        error: err
      })
      console.error(err);
    });
  } else {
    chrome.runtime.sendMessage({
      action: T_DATA.mode,
      status: 401
    })
  }
}