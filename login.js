/*
    - issue (4/1/2020) = I want users to stay logged in 
    and have them redirected to account.html if so. However, the page keeps refreshing when I do
    windows.location.href inside auth.onAuthStateChange
    - resolved: put everything in account.html so authStateChange only do the toggling
*/
 
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

  /**
   * This method changes users' password
   */
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
  
  /**
   * This function is called when users try to delete their account
   * it reauthenticate the user with their password, and then delete them from the user database
   */
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

  /**
   * This function sends an email to user if they forgot their password. 
   */
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
        //get data
        var _date_ = new Date();
        console.log(_date_.getMonth());
        console.log(_date_.getFullYear())
        getData(_date_.getMonth(), _date_.getFullYear());
    } else{
        console.log("no active user")
        $('.login-html').toggle();
        $('#tracker').hide();
    }
})

/**
 * This function store user's stress level to the database
 * path: user/{uid}/year/{year}/month/{month}/entry
 * where the entry contains day, hour, minutes, stress level, stress note
 * 
 * if succesfull, it outputs the new document id to the console
 * if not, it outputs the error to the console
 */

//Stress questionnaire - helper function
var _range_ = 5;
$('.options').on('click', function(){
    console.log(this);
    var inputVal = $(this).data('value');
    _range_ = inputVal;
})
function updateGraph(){
    var d = new Date();
    var uid = auth.currentUser.uid;
    //code to store stuffs to database
    var level =  _range_;
    var note = document.getElementById("logger-note").value;
    console.log(level);
    console.log(note);
    db.collection("users/"+ uid +"/year/" + d.getFullYear()+"/month/" + d.getMonth()+"/entry").add({
        day: d.getDate(),
        hour: d.getHours(),
        minutes:d.getMinutes(),
        stressLevel: level,
        stressNote: note
    }).then(function(docRef) {
        document.getElementById("logger-note").value = ""; //empty note
        console.log("Document written with ID: ", docRef.id);
        getData(d.getMonth(), d.getFullYear());
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
}

/**
 * This function visualize the data from given month & year
 * @param {*} month : month when users log their stress
 * @param {*} year : year when users log their stress
 * it automatically updates the result to tracker-graph div
 */
function getData(month, year){
    var id= auth.currentUser.uid;
    console.log(id);
    //var userDoc = Firestore.instance.collection("users").document(id);
    var refCol = db.collection("users/"+id+"/year/" + year + "/month/"+ month +"/entry");
    console.log(refCol);

    refCol.get().then((querySnapshot) => {
        //if #entries == 1, re-initialize grid
        console.log(querySnapshot.size)
        if(querySnapshot.size === 0){
            var numDays= new Date(year, month + 1, 0).getDate();
            console.log("number of Days: " + numDays);
            makeGrid(numDays);
        }
        //recalculate average stress level, number of docs. Change background
        querySnapshot.forEach((doc) => {
            console.log(`stress level = ${doc.data().stressLevel}`);
            console.log(`note = ${doc.data().stressNote}`);
        });
    });
}

/**
 * This function creates a new grid
 */
function makeGrid(numDays){
    var output = document.getElementById("tracker-graph");
    //container
    var container = document.createElement("div");
    container.className = "days-container";
    container.id = "days-container";
    container.style.display= "grid";
    output.appendChild(container);

    //actual grid
    for(var i = 0 ; i <= numDays; i++){
        var grid = document.createElement("div");
        grid.className= "days-grid";
        grid.id = "grid-" + i;
        container.appendChild(grid);
    }
}
  /*getters*/
  function getUserName(){
    var user = auth.currentUser;
    if(user != null)
        return user.displayName;
    else
        return "Error getting first name";
  }