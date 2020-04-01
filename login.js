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

  /*sign up, sign in, sign out funciton*/
  function signUp(){
      var email = document.getElementById("email");
      var password = document.getElementById("password");

      const promise = auth.createUserWithEmailAndPassword(email.value, password.value);
      promise.catch(e => alert(e.message));

      console.log("Signed up");
  }
  function signIn(){
    var email = document.getElementById("email");
    var password = document.getElementById("password");

    const promise = auth.signInWithEmailAndPassword(email.value, password.value);
    promise.catch(e => alert(e.message));

    console.log("Signed in " + email.value);
  }

  function signOut(){
      auth.signOut();
      console.log("Signed out");
  }

  auth.onAuthStateChanged(function(user){
      if(user){
          //change to account.html
          var email = user.email;
          console.log("active:" + email);
          //is signed in
      } else{
          console.log("no active user")
          //is not signed in
      }
  })