$(document).ready(function() {

	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyAZaH9g0dKyvCnH-DP4WEO_vlLSQqWunZM",
		authDomain: "train-scheduler-498c8.firebaseapp.com",
		databaseURL: "https://train-scheduler-498c8.firebaseio.com",
		projectId: "train-scheduler-498c8",
		storageBucket: "train-scheduler-498c8.appspot.com",
		messagingSenderId: "378773885740"
	};
	firebase.initializeApp(config);


	// checks if the authentication has changed
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			// User is signed in.
			var email = user.email;
			$("#account-details").text(email);
			$("#container").show();
		} else {
			// redirects to login
			window.location = "login.html";
		}
	});

	// logouts the user
	$("#sign-out").on("click", function() {
		firebase.auth().signOut();
	})


	// sets global variables
	var database = firebase.database();
	var trainName;
	var trainDestination;
	var trainTime;
	var trainFrequency;


	// writes data to the firebase based on the user input
	$("#submit-btn").on("click", function(){

		// sets variables based on each input value
		trainName = $("#name-input").val().trim();
		trainDestination = $("#destination-input").val().trim();
		trainTime = $("#first-train-time-input").val().trim();
		trainFrequency = $("#frequency-input").val().trim();

		// validate trainTime input format
		if ( moment(trainTime, "HH:mm").isValid() ) {

			// assumes trains leave each day at the same time
			if ( trainFrequency > (24 * 60) ) {

				alert("Frequency must be less than 1440 min (24h). Please try again!");

			} else {

				// creates the data object to be written to the database
				var newTrain = {
					name : trainName,
					destination : trainDestination,
					time : trainTime,
					frequency : trainFrequency
				}
				console.log(newTrain);

				// creates the object in the database
				database.ref("/trains").push(newTrain);
			}

		} else {

			alert("Not a valid date format. Please enter time in military time format!");

		}

	})

	// reads data from the firebase database
	// uses the "child_added" call-back function as data is changed
	database.ref("/trains").on("child_added", function(child){
		// gets values from the database and stores them in local variables
		var name = child.val().name;
		var destination = child.val().destination;
		var time = moment((child.val().time), "HH:mm").subtract(1, "days");
		var frequency = child.val().frequency;
		var key = child.key;


		// calculates what time (min) arrives the next train
		// holds it in the minToNextTrain variable
		var diffTime = moment().diff(time,"minutes");
		var remainder = diffTime % frequency;
		var minToNextTrain = frequency - remainder;
		console.log(minToNextTrain);


		// calculates what time (hh:mm) the next train is comming
		var trainNextTime = moment().add(minToNextTrain, "minutes");
		var trainNextTimeFormated = moment(trainNextTime).format("hh:mm A");


		// writes data to the HTML/table
		var trainRow = $("<tr>");

		// if train arrives within 15 min alert the user
		if ( minToNextTrain <= 5 ) {
			trainRow.addClass("selected");
		};


		// appends each table cell to the table row
		trainRow.append("<td><button class='btn btn-default glyphicon glyphicon-trash' data-value='"+ key + "'></button></td>");
		trainRow.append("<td>" + name + "</td>");
		trainRow.append("<td>" + destination + "</td>");
		trainRow.append("<td>" + frequency + "</td>");
		trainRow.append("<td>" + trainNextTimeFormated + "</td>");
		trainRow.append("<td>" + minToNextTrain + "</td>");

		// appends table row to the table body
		$("#table-body").append(trainRow);

	});

	// deletes table row data from db
	$(document).on("click", "#table-body button.glyphicon-trash", function () {
		
		database.ref("/trains/" + $(this).data("value")).remove();
		// deleted the table row markup
		$(this).parent().parent().remove();

	});

});










