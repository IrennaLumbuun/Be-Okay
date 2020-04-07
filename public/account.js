/*
    Page flow (handle in login.js):
    1 - first time: show login page
    2 - when button is clicked, we verify info
    3 - when info is verified, login page is hid
    4 - toggle shows stress tracker
    */

    //loader
    $(window).on('load', function(){
        $('#loading').hide();
    });

    //event listener
    document.getElementById("sign-in").addEventListener("click", signIn);
    document.getElementById("sign-up").addEventListener("click", signUp);
    document.getElementById("sign-out").addEventListener("click", signOut);
    document.getElementById("change-password").addEventListener("click", changePassword);
    document.getElementById("delete-account").addEventListener("click", showDeleteAccount);
    document.getElementById("update-graph").addEventListener("click", updateGraph);
    document.getElementById("stress-logger").addEventListener("click", showQuestionnaire);
    document.getElementById("btn-delete-account").addEventListener("click", deleteAccount);
    document.getElementById("btn-update-password").addEventListener("click", updatePassword);
    document.getElementById("forgot-password").addEventListener("click", forgotPassword);
    document.getElementById("btn-fotgot-password").addEventListener("click", showForgotPassword);
    document.getElementById("show-old-pass").addEventListener("click", function(){
        showPassword('old-pass')
    });
    document.getElementById("show-retype-pass").addEventListener("click", function(){
        showPassword('retype-pass')
    });
    document.getElementById("show-password-register").addEventListener("click", function(){
        showPassword('password-register')
    });
    document.getElementById("show-new-pass").addEventListener("click", function(){
        showPassword('new-pass')
    });

    //default:
    $('.login-html').hide();
    $('.error-message').hide();
    $('#tracker').hide();
    $('#changePasswordDiv').hide();
    $('#deleteAccountDiv').hide();
    $('#forgotPasswordDiv').hide();
    $('#stress-questionnaire').hide();

    //show password
    function showPassword(input){
        var pass = document.getElementById(input);
        if (pass.type === "password") {
            pass.type = "text";
        } else {
            pass.type = "password";
        }
    }

    //change password
    function changePassword(){
        $('#changePasswordDiv').show();
        $('.login-html').hide();
        $('#tracker').hide();
        $('#deleteAccountDiv').hide();
    }

    //delete account
    function showDeleteAccount(){
        var confirm = window.confirm("Are you sure you want to delete your account?");
        if(confirm === true){
            $('#changePasswordDiv').hide();
            $('.login-html').hide();
            $('#tracker').hide();
            $('#deleteAccountDiv').show();  
        }
    }
    //forgot password
    function showForgotPassword(){
        $('#changePasswordDiv').hide();
        $('.login-html').hide();
        $('#tracker').hide();
        $('#deleteAccountDiv').hide();
        $('#forgotPasswordDiv').show();
    }

    //stress questionnaire
    function showQuestionnaire(){
        $('#stress-questionnaire').toggle();
        document.getElementById("option5").focus();

    }