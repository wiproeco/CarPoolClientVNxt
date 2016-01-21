
app.controller('UpdateCntrl', function ($scope, $http, $window, $filter, Serviceurl, $rootScope) {
    var logdetails = {
        userid: "",
        logdescription: "",        
    }
    $scope.processing = false;
    $scope.checkuser = true;
    $scope.userName = localStorage.getItem("username");
    var id = window.localStorage.getItem("userid");
    var prevUsername;
    try {
        $http.get(Serviceurl+ "/UpdateProfileDetails/" + id)
        .success(function (data) {
            $scope.username = data[0].userName;
            prevUsername = data[0].userName;            
            $scope.password = data[0].password;
            $scope.email = data[0].email;
            $scope.mobile = data[0].mobile;
            $scope.photo = data[0].photo;
        }).error(function (result, status) {
            logdetails.userid = localStorage.getItem("username");
            logdetails.logdescription = status;
            Errorlog($http, logdetails, true);
        });
    }
    catch (e) {
        logdetails.userid = localStorage.getItem("username");
        logdetails.logdescription = e.message;
        Errorlog($http, logdetails, true);
    }

    $scope.ChangePassword = function () {
        window.location.href = "Changepassword.html";
    }

    $scope.validpassword = true;

    $scope.passwordValidation = function (password) {
        $scope.passworderror = false;
        if (password !== undefined) {
            var passwordReg = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
            $scope.validpassword = passwordReg.test(password);
        }
    }
    // change passowrd screen 
    $scope.UpdatePassword = function () {

        $scope.ismatchpswd = false;

        var password = $scope.txtnewpswd;
        var confirmpassowrd = $scope.txtconfirmpswd;

        if (password !== confirmpassowrd) {
            $scope.ismatchpswd = true;
        }
        else {
            $scope.ismatchpswd = false;

            if (password !== "" && confirmpassowrd !== "" && password !== undefined && confirmpassowrd !== undefined) {
                if (!$scope.validpassword) {
                    $scope.passworderror = true;
                    $("#form-confirm-password").focus();
                } else {
                var updatepswd = {
                    password: $scope.txtnewpswd,
                    id: localStorage.getItem('userid')
                }
                $scope.processing = true;
                try {
                    var url = $http.post(Serviceurl +'/updatePassword', updatepswd, { headers: { 'Content-Type': 'application/json' } });
                    url.success(function (result) {
                        //alert(result);
                        $scope.success = true;
                        $scope.processing = false;
                        window.location.href = "UpdateProfile.html";
                    }).error(function (data, status) {
                        logdetails.userid = localStorage.getItem("username");
                        logdetails.logdescription = status;
                        Errorlog($http, logdetails, true);
                    });
                } catch (e) {
                    logdetails.userid = localStorage.getItem("username");
                    logdetails.logdescription = e.message;
                    Errorlog($http, logdetails, true);
                }
            }
            }
            else {

            }
        }
    }

    $scope.GoBack = function () {
        window.location.href = "UpdateProfile.html";
    }

    $scope.checkUserName = function (username) {
        $scope.checkuser = true;
        var userName = username;
        if (username !== undefined && username!==prevUsername) {
            $http.get(Serviceurl + "/CheckUsername/" + userName)
                .success(function (response) {
                    if (response.length > 0) {
                        $scope.checkuser = false;
                        $("#form-username").focus();
                    }
                }).error(function (data, status) {
                    //  Errorlog($http, logdetails, true);
                });
        }
    }

    //save/update profile in update screen.
    $scope.saveProfile = function () {
        var usrname = $scope.username;
        var password = $scope.password;
        var emailId = $scope.email;
        var mobileno = $scope.mobile;
        //var photo = $scope.photo;

        if (usrname !== "" && password !== "" && emailId !== "" && mobileno !== "" &&
            usrname !== undefined && password !== undefined && emailId !== undefined && mobileno !== undefined) {
            $scope.checkUserName(usrname);
            if ($scope.checkuser) {
                var updatedetails = {
                    id: localStorage.getItem('userid'),
                    username: $scope.username.toLowerCase(),
                    password: $scope.password,
                    email: $scope.email,
                    mobile: $scope.mobile,
                    //photo: $scope.photo
                };
                $scope.processing = true;
                try {
                    var url = $http.post(Serviceurl +'/SaveProfile', updatedetails,
                                              { headers: { 'Content-Type': 'application/json' } });
                    url.success(function (result) {
                        if (result !== "" && result !== undefined) {
                            $scope.success = true;
                            $scope.processing = false;
                            $("#updateform").hide();
                            $(".collapsed").prop("disabled", true);
                            //window.location.href = "NewDashboard.html";
                        }
                    }).error(function (data, status) {
                        logdetails.userid = localStorage.getItem("username");
                        logdetails.logdescription = status;
                        Errorlog($http, logdetails, true);
                    });
                }
                catch (e) {
                    logdetails.userid = localStorage.getItem("username");
                    logdetails.logdescription = e.message;
                    Errorlog($http, logdetails, true);
                }
            }
        } 
    }

    $scope.Cancel = function () {
        window.location.href = "NewDashboard.html";
    }

    $scope.validPhone = true;

    $scope.checkPhoneNumber = function (phone) {
        if (phone !== undefined) {
            var phoneReg = /^\d{10}$/;
            $scope.validPhone = phoneReg.test(phone);
        }
    }

    //$scope.ChangePassword = function () {
    //    alert("hi");
    //    $location.path("/changepassword");
    //   // window.location.href = "Changepassword.html";
    //}

});
