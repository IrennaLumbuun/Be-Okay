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

  const auth = firebase.auth();

  /*sign up, sign in, sign out function*/
  function signUp(){
      var name = document.getElementById("name-register");
      var email = document.getElementById("email-register");
      var password = document.getElementById("password-register");

      //create user
      const promise = auth.createUserWithEmailAndPassword(email.value, password.value)
      .then(
          (user) => {
              user.updateProfile({
                  displayName: name
              }).then(function(){
                console.log("User name=" + name);
            }).catch(function(error){
                alert(error);
          })
        });
      promise.catch(e => alert(e.message + " you wrote'" + email.value+"'"));

      console.log("Signed up: " + name + " " + email);
      /*update user name
      user.updateProfile({
          displayName: name
      }).then(function(){
          console.log("User name=" + name);
      }).catch(function(error){
          alert(error);
      })*/

  }
  function signIn(){
    var email = document.getElementById("email-login");
    var password = document.getElementById("password-login");

    const promise = auth.signInWithEmailAndPassword(email.value, password.value);
    promise.catch(e => alert(e.message));

    console.log("Signed in " + email.value);
  }

  function signOut(){
      auth.signOut();
      console.log("Signed out");
  }

  function getUserName(){
    var user = auth.currentUser;
    if(user != null)
        return user.displayName;
    else
        return "Error getting first name";
  }

//redirect user after they signed in
  auth.onAuthStateChanged(function(user){
      if(user){
          //change to account.html
          var email = user.email;
          console.log("active:" + email);
          window.location.href= "account.html";
      } else{
          console.log("no active user")
          //is not signed in
      }
  })