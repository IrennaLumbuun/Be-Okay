/*
    - issue (4/1/2020) = I want users to stay logged in 
    and have them redirected to account.html if so. However, the page keeps refreshing when I do
    windows.location.href inside auth.onAuthStateChange
    - resolved: put everything in account.html so authStateChange only do the toggling
*/
 
  const firebase = require("firebase");
  // Required for side-effects
  require("firebase/firestore");
 // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyBqy2mvmGkBBVe9QUTvWCUNi7Y1oULpZRI",
    authDomain: "be-okay-70e93.firebaseapp.com",
    databaseURL: "https://be-okay-70e93.firebaseio.com",
    projectId: "be-okay-70e93",
    storageBucket: "be-okay-70e93.appspot.com",
    messagingSenderId: "162672254199",
    appId: "1:162672254199:web:f515e431beadec636407f2",
    measurementId: "G-KWKD6T3M8H"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  //firebase.analytics();
  var db= firebase.firestore();
  const auth = firebase.auth();

  function signUp(){
      var name = document.getElementById("name-register");
      var email = document.getElementById("email-register");
      var password = document.getElementById("password-register");

      const promise = auth.createUserWithEmailAndPassword(email.value, password.value)
      promise.catch(e => alert(e.message));

      auth.onAuthStateChanged(function(user){
        var user = auth.currentUser;
        /*change name
        user.updateProfile({
            displayName: name.value
        }).catch(function(error){
            alert(error);
        })*/
        //send email verification
        user.sendEmailVerification().then(function() {
            // Email sent.
        }).catch(function(error) {
            alert(error);
        });
    })
  }
  function signIn(){
    var email = document.getElementById("email-login");
    var password = document.getElementById("password-login");
    const promise = auth.signInWithEmailAndPassword(email.value, password.value)

    promise.catch(e => alert(e.message));
    console.log("Signed in " + email.value);
  }

  function signOut(){
      auth.signOut();
      console.log("Signed out");
  }
  function updatePassword(){
      console.log("inside update password");
      var user = auth.currentUser;
      var newPassword = document.getElementById("new-pass");
      var oldPassword = document.getElementById("old-pass");

      const credential = firebase.auth.EmailAuthProvider.credential(
        user.email, 
        oldPassword.value
    );
    // Prompt the user to re-provide their sign-in credential
      user.reauthenticateWithCredential(credential).then(function() {
        user.updatePassword(newPassword.value).then(function() {
            alert("your password has been updated");
            $('#changePasswordDiv').hide();
            $('.login-html').hide();
            $('#tracker').show();
          }).catch(function(error) {
              console.log("error updating password " + error);
          });    
      }).catch(function(error) {
          console.log("error re-authenticating: " + error);
      });
  }
  function deleteAccount(){
    var user = auth.currentUser;
    var password = document.getElementById("retype-pass");
    const credential = firebase.auth.EmailAuthProvider.credential(
        user.email, 
        password.value
    );
    // Prompt the user to re-provide their sign-in credential
      user.reauthenticateWithCredential(credential).then(function() {
        user.delete().then(function() {
            // User deleted.
            window.location ="account.html";
            alert("succesful delete");
        }).catch(function(error) {
            alert("Error deleting account " + error);
        });
      }).catch(function(error) {
          console.log("error re-authenticating " + error);
      });
  }

  function forgotPassword(){
    var emailAddress = document.getElementById("retype-email");

    auth.sendPasswordResetEmail(emailAddress).then(function() {
        $('forgotPasswordDiv').hide();
        $('.login-html').show();
        alert("email sent")
    }).catch(function(error) {
        alert(error);
    });
  }

//redirect user after they signed in
auth.onAuthStateChanged(function(user){
    if(user){
        //has a user
        var email = user.email;
        console.log("active:" + email);
        $('#tracker').toggle();
        $('.login-html').hide();
    } else{
        console.log("no active user")
        $('.login-html').toggle();
        $('#tracker').hide();
    }
})

//Stress questionnaire
function updateGraph(){
    //code to store stuffs to database
}

  /*getters*/
  function getUserName(){
    var user = auth.currentUser;
    if(user != null)
        return user.displayName;
    else
        return "Error getting first name";
  }