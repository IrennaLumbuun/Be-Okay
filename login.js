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
        $('#forgotPasswordDiv').hide();
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
    var inputVal = $(this).data('value');
    _range_ = inputVal;
})
function updateGraph(){
    var d = new Date();
    var uid = auth.currentUser.uid;
    //code to store stuffs to database
    var level =  _range_;
    var note = document.getElementById("logger-note").value;
    db.collection("users/"+ uid +"/year/" + d.getFullYear()+"/month/" + d.getMonth()+"/entry").add({
        day: d.getDate(),
        hour: d.getHours(),
        minutes:d.getMinutes(),
        stressLevel: level,
        stressNote: note
    }).then(function(docRef) {
        document.getElementById("logger-note").value = ""; //emptying note
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
    var refCol = db.collection("users/"+id+"/year/" + year + "/month/"+ month +"/entry");

    refCol.get().then((querySnapshot) => {
        var numDays= new Date(year, month + 1, 0).getDate();
        makeGrid(numDays, month, year);

        // get today's date -> filter query -> add total -> add to document called color
        var today = new Date().getDate();
        var query = refCol.where("day", "==", today);

        query.get().then(function(querySnapshot) {
            var totalStress = 0;
            var size = querySnapshot.size;
            querySnapshot.forEach(function(doc) {
                totalStress += doc.data().stressLevel;
                //console.log(`stress level = ${doc.data().stressLevel}`);
                //console.log(`note = ${doc.data().stressNote}`);
            });
            //call function to determine color
            determineColor(totalStress, size);
            updateGrid();
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });
    });

}

/**
 * This function determine the background color of our stress tracker
 * @param {*} totalStress 
 * @param {*} size 
 */
function determineColor(totalStress, size){
    var color = ['#5b9648','#6cc251', '#a0d620', '#c7d450', '#e39d07', '#e38b07', '#de6e18', '#a13800', '#a10000', '#750000'];
    var index = Math.floor(totalStress/size) - 1;
    var d = new Date();
    var uid = auth.currentUser.uid;

    //add to summary
    db.doc("users/"+ uid +"/year/" + d.getFullYear()+"/month/" + d.getMonth()+"/summary/"+ d.getDate()).set({
        bg: color[index],
        total: totalStress,
        size: size
    }).then(function(docRef) {
        console.log("success adding to summary "+ docRef);
    })
    .catch(function(error) {
        console.error("Error adding to summary: ", error);
    });
}

/**
 * This method updates each color in the grid
 */
function updateGrid(){
    var d = new Date();
    var uid = auth.currentUser.uid;
    //get all docs in summary
    db.collection("users/"+ uid +"/year/" + d.getFullYear()+"/month/" + d.getMonth()+"/summary")
    .get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            //get respective div
            var div = document.getElementById("grid-" + doc.id);
            console.log("retrieved div = " + div);
            //do color :-)
            div.style.backgroundColor = doc.data().bg;
        });
    });
}

/**
 * This function creates a new grid
 */
function makeGrid(numDays, month, year){
    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
    var output = document.getElementById("tracker-graph");
    output.innerHTML = '';

    //date
    var date = document.createElement('p');
    date.id = "tracker-date";
    date.textContent = monthNames[month] + ' ' + year;
    output.appendChild(date);

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
        grid.setAttribute("data-value", i)
        grid.setAttribute('onclick', 'showEntries('+i+','+ month +','+ year +')');
        container.appendChild(grid);
    }
}

/*
$('div.days-grid').on('click', function(){
    console.log("clicked");
    var date = document.getElementById(tracker-date).value;
    var inputVal = $(this).attr('id');
    var indexSeparator = date.indexOf("/");
    var month = date.substring(0, indexSeparator);
    var year = date.substring(indexSeparator+1)
    console.log("retrieved id " + inputVal);

    showEntries(month, year, inputVal);
})*/

/**
 * This function show all entries made on that day when user clicks on the grid
 */
function showEntries(day, month, year){
    console.log("show entries");
    var id= auth.currentUser.uid;
    var output = document.getElementById("tracker-entry");
    var refCol = db.collection("users/"+ id +"/year/" + year + "/month/"+ month +"/entry");
    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
    
    output.innerHTML="";
    var date =  document.createElement("h1");
    date.className = "entry-date";
    date.textContent = (day+1) + " " + monthNames[month] + " " +year;
    output.appendChild(date);
    //this return all entries in that month
    refCol.get().then((querySnapshot) => {
        var query = refCol.where("day", "==", day);
        query.get().then(function(querySnapshot) {
            var number = 1;
            querySnapshot.forEach(function(doc) {
                //entry container
                var container = document.createElement("div");
                container.id = day + "-entry-container";
                container.className = "entry-container";
                output.appendChild(container);
                //create entry
                var title =  document.createElement("p");
                title.className = "entry-number";
                title.textContent = "#" + number++ + " - " + doc.data().hour + "." + doc.data().minutes;
                container.appendChild(title);

                var stressLevel = document.createElement("p");
                stressLevel.className="entry-stressLevel";
                stressLevel.textContent = "stress: " + doc.data().stressLevel;
                container.appendChild(stressLevel);

                var stressNote = document.createElement("p");
                stressNote.className="entry-stressNote";
                stressNote.textContent = "note: " + doc.data().stressNote;
                container.appendChild(stressNote);
            });
        })
        .catch(function(error) {
            console.log("Error displaying entries: ", error);
        });
    });
}
  /*getters*/
  function getUserName(){
    var user = auth.currentUser;
    if(user != null)
        return user.displayName;
    else
        return "Error getting first name";
  }