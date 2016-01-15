function getUrlParameter(param, dummyPath) {
    var sPageURL = dummyPath || window.location.search.substring(1),
        sURLVariables = sPageURL.split(/[&||?]/),
        res;

    for (var i = 0; i < sURLVariables.length; i += 1) {
        var paramName = sURLVariables[i],
            sParameterName = (paramName || '').split('=');

        if (sParameterName[0] === param) {
            res = sParameterName[1];
        }
    }
    return res;
}

app.factory('userfactory', function () {
    var _usertype = false;
    return {
        setUserType: function (usertype) {
            _usertype = usertype;
        },
        getUserType: function () {
            return _usertype;
        }
    };
});