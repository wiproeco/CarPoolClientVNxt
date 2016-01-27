app.service('UserService', function () {
    var _isOwner = false;

    this.setUsertype = function (IsOwner) {
        _isOwner = IsOwner;
    }
    this.getUserType = function () {
        return _isOwner;
    }
});



app.controller('userCtrl', ['$scope', '$http', '$window', '$filter', 'Serviceurl', '$rootScope',
    function ($scope, $http, $window, $filter, Serviceurl, $rootScope) {
        $scope.authenticated = false;
        $scope.iserror = false;
        $scope.success = false;
        $scope.errormsg = false;

        var logdetails = {
            userid: "",
            logdescription: "",
        }
        $scope.IsError = false;
        var numofLoginAttempts;
        $scope.login = function () {
            var emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if ($scope.txtEmail != undefined) {
                if (emailReg.test($scope.txtEmail)) {
                    var email = $scope.txtEmail;
                    var pass = $scope.txtPassword;
                    var owner = $scope.Owner;
                    window.localStorage.setItem("loginAsOwnerOrNot", owner);
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
                                    // userfactory.setUserType(isowner);
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
                                        Errorlog($http, $scope, logdetails, false);
                                        numofLoginAttempts = 0;
                                    }
                                }
                            })
                            .error(function (data, status) {
                                $scope.authenticated = true;
                                document.getElementById("Loading").style.display = "none";
                                logdetails.userid = $scope.txtEmail;
                                logdetails.logdescription = status;
                                Errorlog($http, $scope, logdetails, true);

                            });
                        }
                        catch (e) {
                            logdetails.userid = $scope.txtEmail;
                            logdetails.logdescription = e.message;
                            Errorlog($http, $scope, logdetails, true);
                        }

                    }
                    else { document.getElementById("Loading").style.display = "none"; }

                } else {
                    //$("#errordiv").show();
                    //$("#errormsg").show();
                    $scope.authenticated = false;
                    $scope.errormsg = true;
                    //$scope.validEmail=true;
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
        $scope.validPhone = false;
        $scope.validpassword = false;
        $scope.checkuser = false;
        $scope.checkemail = false;

        $scope.checkEmail = function (email) {
            $scope.checkemail = true;
            var Email = email.toLowerCase();
            var emailexits;
            if (Email !== undefined) {
                var emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                $scope.validEmail = emailReg.test(email);
                if ($scope.validEmail) {
                    $http.get(Serviceurl + "/CheckEmail/" + Email)
                   .success(function (response) {
                       if (response.length > 0) {
                           emailexits = true;
                       }
                       if (emailexits == true) {
                           $scope.checkemail = false;
                           $scope.authenticated = false;
                       }

                   }).error(function (data, status) {
                       //  Errorlog($http, logdetails, true);
                   });
                } else {
                    $scope.checkemail = true;
                }
            }
        }

        $scope.checkUserName = function (username) {
            $scope.checkuser = false;
            //var userName = username.toLowerCase();
            try {
                if (username !== undefined && username !== "") {
                    var userName = username.toLowerCase();
                    $scope.txtuser = false;
                    $http.get(Serviceurl + "/CheckUsername/" + userName)
                        .success(function (response) {
                            if (response.length > 0) {
                                $scope.checkuser = true;
                            }
                        }).error(function (data, status) {
                            logdetails.userid = userName;
                            logdetails.logdescription = status;
                            Errorlog($http, logdetails, true);
                        });
                } else {
                    $scope.txtuser = true;
                }
            } catch (e) {
                $scope.txtuser = true;
                logdetails.userid = userName;
                logdetails.logdescription = e.message;
                Errorlog($http, logdetails, true);
            }
        }

        $scope.checkemailReg = false;
        $scope.validEmailReg = false;


        $scope.checkEmailReg = function (email) {
            $scope.checkemailReg = false;
            var emailexits;
            if (email !== undefined && email !== "") {
                var Email = email.toLowerCase();
                if (Email !== undefined) {
                    $scope.txtemail = false;
                    var emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    if (emailReg.test(email)) {
                        // $scope.validEmail = true;
                        $http.get(Serviceurl + "/CheckEmail/" + Email)
                      .success(function (response) {
                          if (response.length > 0) {
                              emailexits = true;
                          }
                          if (emailexits == true) {
                              $scope.checkemailReg = true;
                              //$scope.authenticated = false;
                              $scope.validEmailReg = false;
                          } else {
                              $scope.validEmailReg = false;
                          }

                      }).error(function (data, status) {
                          $scope.validEmailReg = false;
                          Errorlog($http, logdetails, true);
                      });
                    }
                    else {
                        $scope.validEmailReg = true;
                    }
                }
            } else {
                $scope.txtemail = true;
            }
        }

        $scope.checkPhoneNumber = function (phone) {
            if (phone !== undefined && phone !== "") {
                $scope.txtmobile = false;
                var phoneReg = /^\d{10}$/;
                if (phoneReg.test(phone)) {
                    $scope.validPhone = false;
                }
                else {
                    $scope.validPhone = true;
                }
            } else {
                $scope.txtmobile = true;
            }
        }

        $scope.accepttermsandconditions = function () {
            $("#termsandconditions").modal("toggle");
        }

        $scope.passwordValidation = function (password) {
            if (password !== undefined && password !== "") {
                $scope.txtpassword = false;
                var passwordReg = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
                if (passwordReg.test(password)) {
                    $scope.validpassword = false;
                } else {
                    $scope.validpassword = true;
                }
            } else {
                $scope.txtpassword = true;
            }
        }

        $scope.AddUser = function () {
             $scope.gender = false;
            $scope.EmailId = false;
            $scope.UserNameerror = false;
            $scope.termsandcond = false;
            $scope.passworderror = false;
            $scope.carnumber = false;
            $scope.phoneno = false;

            $scope.txtmobile = false;
            $scope.txtemail = false;
            $scope.txtpassword = false;
            $scope.txtuser = false;

            var emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var phoneReg = /^\d{10}$/;
            if ($scope.txtRegEmail != undefined && $scope.txtRegMobile != undefined) {
                if (!emailReg.test($scope.txtRegEmail)) {
                    $("#errormsg").html("Please enter valid email");
                    $("#form-emailId").focus();
                }
                else if (!phoneReg.test($scope.txtRegMobile)) {
                    //$("#errordiv").show();
                    //$("#errormsg").show();
                    $("#errormsg").html("Please enter valid phone number");
                    $("#form-mobileno").focus();
                } else if ($scope.checkemailReg) {
                    //$scope.iserror = true;
                    $scope.EmailId = false;
                    // $("#errormsg").html("Email ID already exists");
                    $("#form-emailId").focus();
                }
                else if ($scope.checkuser) {
                    //$scope.iserror = true;
                    $scope.UserNameerror = false;
                    //$("#errormsg").html("User already exists");
                    $("#form-username").focus();
                }
                else if ($scope.inputRegGender === undefined) {
                    //$scope.error = false;
                    $scope.gender = true;
                    //$("#errormsg").html("Select Gender");
                    $("#optionsRadiosInline1").focus();
                }
                else if ($scope.validpassword) {
                    $scope.passworderror = true;
                    $("#form-password").focus();
                }
                else if ($scope.termsandconditions === undefined || $scope.termsandconditions === false) {
                    //$scope.iserror = true;
                    $scope.termsandcond = true;
                    //$("#errormsg").html("Accept Terms and Conditions");
                    $("#form-termsandconditions").focus();
                } else if ($scope.edit && $scope.carno === undefined) {
                    $scope.carnumber = true;
                    $("#form-carnumber").focus();
                }
                else {

                    var UserName = $scope.txtRegUserName.toLowerCase();
                    var Password = $scope.txtRegPwd;
                    var ConfirmPwd = $scope.txtRegConfirmPwd;
                    var Email = $scope.txtRegEmail.toLowerCase();
                    var Mobile = $scope.txtRegMobile;
                    var Gender = $scope.inputRegGender;
                    var isCarOwner = $scope.edit;
                    var binaryImage = window.localStorage.getItem("binaryImage");
                    var carNo = "";
                    //   var seatCap = "";
                    if (isCarOwner) {
                        carNo = $scope.carno;
                        //  seatCap = $scope.seats;
                    }
                    if (Password != ConfirmPwd) {
                        $scope.ismatch = false;
                    } else {
                        $scope.ismatch = true;
                    }
                    //$scope.ismatch &&
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
                            //  totalseats: seatCap,
                            photo: binaryImage,
                            currgeolocnaddress: "",
                            currgeolocnlat: "",
                            currgeolocnlong: "",
                            rides: [
                            ]
                        });
                        $scope.processing = true;
                        try {
                            var res = $http.post('http://wiprocarpool.azurewebsites.net/register', user,
                                      { headers: { 'Content-Type': 'application/json' } });
                            res.success(function (data, status, headers, config) {
                                $scope.iserror = false;
                                $scope.success = true;
                                $scope.txtRegUserName = '';
                                $scope.txtRegPwd = '';
                                $scope.txtRegConfirmPwd = '';
                                $scope.txtRegEmail = '';
                                $scope.txtRegMobile = '';
                                $scope.termsandconditions = '';
                                $scope.inputRegGender = '';
                                $scope.carno = '';
                                $scope.processing = false;
                                $scope.isCarOwner = false;
                                $scope.edit = false;
                                window.localStorage.removeItem("binaryImage");
                                document.getElementById('selfieImage').style.border = "2px dotted #808080";
                                document.getElementById('selfieImage').innerHTML = "120 X 90";
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
                                $scope.termsandconditions = '';
                                $scope.inputRegGender = '';
                                $scope.carno = '';
                                $scope.processing = false;
                                logdetails.userid = $scope.txtRegEmail;
                                logdetails.logdescription = status;
                                Errorlog($http, $scope, logdetails, true);
                            });
                        } catch (ex) {
                            logdetails.userid = $scope.txtRegEmail;
                            logdetails.logdescription = ex.message;
                            Errorlog($http, $scope, logdetails, true);
                        }
                    }
                    return false;
                }
            }else {
                $scope.phoneno = true;
            }
        }
    }]);

