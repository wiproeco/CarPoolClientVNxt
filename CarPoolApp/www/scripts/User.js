app.service('UserService', function () {
    var _isOwner = false;

    this.setUsertype = function (IsOwner) {
        _isOwner = IsOwner;
    }
    this.getUserType = function () {
        return _isOwner;
    }
});



app.controller('userCtrl', ['$scope', '$http', '$window', '$filter', 'Serviceurl', 'userfactory', '$rootScope', function ($scope, $http, $window, $filter, Serviceurl, userfactory, $rootScope) {
    $scope.authenticated = false;
    $scope.iserror = false;
    $scope.success = false;
    $scope.errormsg = false;
    //$("#errormsg").hide();
    //$("#errordiv").hide();
    var logdetails = {
        userid: "",
        logdescription: "",
        logDate: $filter('date')(new Date(), 'dd/MM/yyyy'),
        logTime: $filter('date')(new Date(), 'HH:mm'),
        type: 'Diagnostic'
    }
    var numofLoginAttempts;
    $scope.login = function () {
        //$("#errordiv").hide();
        //$("#errormsg").hide();
       
        var emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if ($scope.txtEmail != undefined) {
            if (emailReg.test($scope.txtEmail)) {
                var email = $scope.txtEmail;
                var pass = $scope.txtPassword;
                document.getElementById("Loading").style.display = "block";
                if (email != "" && pass != "" && email != undefined && pass != undefined) {
                    try {
                        $http.get(Serviceurl + "/authenticate/" + email + "/" + pass)
                        .success(function (response) {
                            var data = JSON.stringify(response);
                            var result = JSON.parse(data);
                            if (result.length > 0) {
                                var userid = result[0].id;
                                var isowner = result[0].isowner;
                                var username = result[0].userName;
                                
                                if (isowner) {
                                    isowner = $scope.edit;
                                }
                                userfactory.setUserType(isowner);
                                $rootScope.isowner = isowner;
                                window.localStorage.setItem("userid", userid);
                                window.localStorage.setItem("isowner", isowner);
                                window.localStorage.setItem("username", username);
                                window.localStorage.setItem("isownerSelection", $scope.edit);
                                window.location.href = 'Home.html';
                               
                                numofLoginAttempts = 0;
                            }
                            else {
                                document.getElementById("Loading").style.display = "none";
                                $scope.authenticated = true;
                                if (numofLoginAttempts == undefined) {
                                    numofLoginAttempts = 1;
                                }
                                else {
                                    numofLoginAttempts = numofLoginAttempts + 1;
                                }
                                if (numofLoginAttempts >= 3) {
                                    //$scope.authenticated = true;
                                    logdetails.userid = $scope.txtEmail;
                                    logdetails.logdescription = $scope.txtEmail + " login attempt failed more than 3 times....";
                                    Errorlog($http, logdetails, false);
                                    numofLoginAttempts = 0;
                                }
                            }

                        })
                        .error(function (data, status) {
                            $scope.authenticated = true;
                            document.getElementById("Loading").style.display = "none";
                            logdetails.userid = $scope.txtEmail;
                            logdetails.logdescription = status;
                            Errorlog($http, logdetails, true);

                        });
                    }
                    catch (e) {
                        logdetails.userid = $scope.txtEmail;
                        logdetails.logdescription = e.message;
                        Errorlog($http, logdetails);
                    }

                }
                else { document.getElementById("Loading").style.display = "none"; }

            } else {
                //$("#errordiv").show();
                //$("#errormsg").show();
                $scope.authenticated = false;
                $scope.errormsg = true;
                $("#errormsg").html("Enter valid email");
                $("#form-username").focus();
                $scope.txtPassword = "";
            }
        }
    }
    $scope.edit = false;
    $scope.change = function (Owner) {

        if (Owner == true)
            $scope.edit = true;
        else
            $scope.edit = false;
    }
    $scope.iserror = false;
    $scope.success = false;
    $scope.ismatch = true;

    $scope.validEmail = true;
    $scope.validPhone = true;

    $scope.checkEmail = function (email) {

        if (email !== undefined) {
            var emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            $scope.validEmail = emailReg.test(email);
            $scope.authenticated = false;
        }
    }

    $scope.checkPhoneNumber = function (phone) {
        if (phone !== undefined) {
            var phoneReg = /^\d{10}$/;
            $scope.validPhone = phoneReg.test(phone);
        }
    }

    $scope.AddUser = function () {
        //$("#errordiv").hide();
        //$("#errormsg").hide();
        var emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var phoneReg = /^\d{10}$/;
        if ($scope.txtRegEmail != undefined && $scope.txtRegMobile != undefined) {
            if (!emailReg.test($scope.txtRegEmail)) {
                //$("#errordiv").show();
                //$("#errormsg").show();
                $("#errormsg").html("Enter valid email");
                $("#form-emailId").focus();
            } else
                if (!phoneReg.test($scope.txtRegMobile)) {
                    //$("#errordiv").show();
                    //$("#errormsg").show();
                    $("#errormsg").html("Enter valid phone number");
                    $("#form-mobileno").focus();
                } else {


                    var UserName = $scope.txtRegUserName;
                    var Password = $scope.txtRegPwd;
                    var ConfirmPwd = $scope.txtRegConfirmPwd;
                    var Email = $scope.txtRegEmail;
                    var Mobile = $scope.txtRegMobile;
                    var Gender = $scope.inputRegGender;
                    var isCarOwner = $scope.edit;
                    var binaryImage = window.localStorage.getItem("binaryImage");
                    var carNo = "";
                    var seatCap = "";
                    if (Password != ConfirmPwd) {
                        $scope.ismatch = false;
                    } else {
                        $scope.ismatch = true;
                    }
                    if (isCarOwner) {
                        carNo = $scope.carno;
                        seatCap = $scope.seats;
                    }
                    //$window.alert(UserName + ',' + Password + ',' + Email + ',' + Mobile + ',' + Gender + ',' + isCarOwner + ',' + carNo + ',' + seatCap + ',' + spoint + ',' + epoint);
                    if ($scope.ismatch && UserName != "" && Password != "" && ConfirmPwd != "" && Email != "" && Mobile != "" && Gender != ""
                       && UserName != undefined && Password != undefined && ConfirmPwd != undefined && Email != undefined && Mobile != undefined && Gender != undefined) {


                        var user = JSON.stringify({
                            type: "user",
                            userName: UserName,
                            password: Password,
                            email: Email,
                            mobile: Mobile,
                            gender: Gender,
                            isowner: isCarOwner,
                            carNo: carNo,
                            totalseats: seatCap,
                            photo: binaryImage,
                            currgeolocnaddress: "",
                            currgeolocnlat: "",
                            currgeolocnlong: "",
                            rides: [
                            ]
                        });
                        $scope.processing = true;
                        try {
                            var res = $http.post('http://carpoolwipro.azurewebsites.net/register', user,
                                      { headers: { 'Content-Type': 'application/json' } });
                            res.success(function (data, status, headers, config) {
                                $scope.iserror = false;
                                $scope.success = true;
                                $scope.txtRegUserName = '';
                                $scope.txtRegPwd = '';
                                $scope.txtRegConfirmPwd = '';
                                $scope.txtRegEmail = '';
                                $scope.txtRegMobile = '';
                                $scope.carno = '';
                                $scope.processing = false;
                                window.localStorage.removeItem("binaryImage");
                            });
                            res.error(function (data, status, headers, config) {
                                $scope.iserror = true;
                                $scope.success = false;
                                $scope.Error = data;
                                $scope.txtRegUserName = '';
                                $scope.txtRegPwd = '';
                                $scope.txtRegConfirmPwd = '';
                                $scope.txtRegEmail = '';
                                $scope.txtRegMobile = '';
                                $scope.carno = '';
                                $scope.processing = false;
                                logdetails.userid = $scope.txtRegEmail;
                                logdetails.logdescription = status;
                                Errorlog($http, logdetails, true);
                            });
                        } catch (ex) {
                            logdetails.userid = $scope.txtRegEmail;
                            logdetails.logdescription = ex.message;
                            Errorlog($http, logdetails, true);
                        }
                    }
                    return false;
                }
        }

    }
}]);

