var oneWayForm = `<form id= infoform>
<fieldset>
<legend>Personal information:</legend>
First name:<br>
<input type="text" id="firstname" required><br>
Last name:<br>
<input type="text" id="lastname" required ><br><br>
</fieldset>
<fieldset>
<legend>Ticket Information:</legend>
Departure Airport Code:<br>
<input list="codes" id="departure" required><br> 
Destination Aiport Code:<br>
<input list="codes" id="destination" required><br>
Date of Travel: <br>
<input type="date" id="date" required><br>
</fieldset>

</form>
<button id=infoSubmit>Search</button>`;
var roundForm = `<form id= infoform>
<fieldset>
<legend>Personal information:</legend>
First name:<br>
<input type="text" id="firstname" required><br>
Last name:<br>
<input type="text" id="lastname" required ><br><br>
</fieldset>
<fieldset>
<legend>Ticket Information:</legend>
Departure Airport Code:<br>
<input list="codes" id="departure" required><br> 
Destination Aiport Code:<br>
<input list="codes" id="destination" required><br>
Date of Going: <br>
<input type="date" id="dateGo" required><br>
Date of Returning: <br>
<input type="date" id="dateReturn" required><br>
</fieldset>
</form>
<button id=infoSubmit>Search</button>`;
var checkoutForm = `<form id= outform>
<fieldset>
<legend>Personal information:</legend>
First name:<br>
<input type="text" id="firstname" required><br>
Last name:<br>
<input type="text" id="lastname" required ><br>
Age:<br>
<input type="number" id="age" required><br>
Gender:<br>
<input type="text" id="gender" required><br>
</fieldset>
<fieldset>
<legend>Seat Selection</legend>
Cabin(First-$500, Economy-$300, Budget-$200):<br>
<input type = "text" id = "cabin" required><br>
Location(Window, Aisle, Exit):<br>
<input type = "text" id = "location" required>
</fieldset>
<fieldset>
<legend>Flight Information</legend>
Flight Id:
<input type="number" id="f_Id" required><br>
To:
<input type="text" id="aport_to" required><br>
From:
<input type="text" id="aport_from" required><br>
Time:
<input type="text" id="time" required><br>
</form>`;
var root = "http://comp426.cs.unc.edu:3001/";
var firstBody;
var fname;
var lname;
var initbool = false;
var departure;
var arrival;
var date;
var header;
var codes = [];
var aids = {};
var raids = {};

var possibleFlights = [];
var today;

$(document).ready(function () {
    firstBody = $("body").html();
    listeners();
});
function listeners() {
    $("#oneway").on("click", function () {
        OpenOneWayInterface()
    });
    /*$("#round").on("click", function () {
        OpenRoundInterface()
    });*/
    $("#search").on("click", function () {
        OpenViewScreen()
    });
}
function OpenViewScreen(){
    let body = $("body")
    body.empty();
    body.addClass("parallax");
    
    createMenuAvail();
    makeHomeListener();
    acceptableCodes();
    let flights = $("div");
    body.append("Date of Travel: <br> <input type='date' id='date'><br>");
    
    body.append("<button id=dateSubmit>Submit</button>")
    
    $("#dateSubmit").on("click", function () {
        today = $('#date').val().toString();
        console.log(today)
        $.ajax(root + "instances?filter[date]="+today,
        {
            type: 'GET',
            dataType: 'JSON',
            xhrFields: { withCredentials: true },
            success: (response) => {
                body.append(`<table id=availableFlights style="width:100%">
                <thead>
                <tr>
                  <th >Flight Number</th>   
                  <th >Departing From</th>
                  <th >Arriving To</th> 
                  <th >Departing At</th>
                </tr>
                </thead>
                <tbody>
                </tbody>`)
                var myTable = $("#availableFlights").DataTable({
                    select: 'single',
                    buttons: [
                        {
                            extend: 'selectedSingle',
                            text: 'Log selected data',
                            action: function ( e, dt, button, config ) {
                                console.log( dt.row( { selected: true } ).data() );
                            }
                        }
                    ]
                });
                
                response.forEach(function(e){
                    $.ajax(root+"flights/"+e.flight_id,
                    {
                        type: 'GET',
                        dataType: 'JSON',
                        xhrFields: { withCredentials: true },
                        success: (response) =>{

                            myTable.row.add([e.flight_id, raids[response.departure_id],raids[response.arrival_id],response.departs_at.toString().slice(11,-1)]).draw()
                            
                        }
                    })
                });

            $("body").append("<button id=check>Check Out</button>");
            makeCheckOutListener(myTable); 
            }   
        })
        
    });
    
    



}
function makeCheckOutListener(e){
    $("#check").on("click", function(){
        let a = e.rows( { selected: true } ).data();
        let fnumber = a[0]
        console.log(fnumber)
        CheckOutView(fnumber);
        
    })
}
function CheckOutView(a){
    let body = $("body");
    body.empty()
    body.append('<h1>Check Out Interface</h1><br>');
    body.append(checkoutForm);
    body.append("<button id=buy>Buy</button>")
    $("#firstname").val(fname);
    $("#lastname").val(lname);
    $("#f_Id").val(a[0])
    $("#aport_to").val(a[2])
    $("#aport_from").val(a[1])
    $("#time").val(a[3])
    arrival = a[2]
    makeBuyListener();

}
function makeBuyListener(){
    let query1 = $("#f_Id").val().toString()
    $("#buy").on("click", function(){
        $.ajax(root+"flights/"+ query1,
        {
            type: 'GET',
            dataType: 'JSON',
            xhrFields: {withCredentials:true},
            success: (response) => {
                console.log("got plane id")
                p_id = response["plane_id"]
                
                
                $.ajax(root+"seats",
                {
                    type: 'POST',
                    
                    data: {
                        "seat":{
                            "plane_id": p_id,
                            "row": Math.floor(Math.random() * 100),
                            "number": "A",
                            "cabin": $("#cabin").val().toString(),
                            "info": $("#firstname").val().toString() + " " + $("#lastname").val().toString()+"'s Seat"

                        }
                    },
                    xhrFields: {withCredentials: true},
                    success: (response) =>{
                        let s_id = response["id"]
                        $.ajax(root+"tickets",
                            {
                                type: 'POST',
                                xhrFields: { withCredentials: true },
                                data: {
                                    "ticket": {
                                        "first_name":   $("#firstname").val().toString(),
                                        "last_name":    $("#lastname").val().toString(),
                                        "age":          parseInt($("#age").val()),
                                        "gender":       $("#gender").val().toString(),
                                        "is_purchased": true,
                                        "seat_id":      s_id,
                                        "info":         query1
                                    },
                                
                                success:(response) =>{  
                                    $.ajax(root+"itineraries",
                                    {
                                        type: 'POST',
                                        data: {
                                            "itinerary": {
                                                "email":  "nalla20y@live.unc.edu",
                                                "info": $("#firstname").val().toString() + " " + $("#lastname").val().toString()+"'s Journey from "+$("#aport_from").val().toString()+" to " +$("#aport_to").val().toString()
                                            }

                                        },
                                        xhrFields: { withCredentials: true },
                                        success: (response) => {
                                            let body = $("body");
                                            body.empty();
                                            createMenuAvail();
                                            makeHomeListener();
                                            body.append("<h1>Your ticket has been purchased. Your itinerary confirmation id is: "+ response["id"] );
                                            body.append("If you want to view a short video about your destination please press the button below<br>");
                                            body.append("<button id=video >Watch Video</button>");
                                            body.append("<div id=results></div>")
                                            
                                            makeVideoListener();
                                        }
                                    });
                                }
                                }
                            }
                        );
                    } 
                }
                ); 
            }
            

        });
    });
}
function init(){
    gapi.client.setApiKey("AIzaSyAjE6z7nI3zqSLcxBKMe9TxvO_rjTzW-kE");
    gapi.client.load("youtube","v3")
}
function vidreplace(e,t){res=e;for(var n=0;n<t.length;n++){res=res.replace(/\{\{(.*?)\}\}/g,function(e,r){return t[n][r]})}return res}
function makeVideoListener(){
    console.log("vidStart: ");
    init()
    
    $("#video").on("click", function () {
        
        var request73 = gapi.client.youtube.search.list({
            part: "snippet",
            type: "video",
            q: encodeURIComponent(arrival + " airport tour"),
            maxResults: 1
             
        });
        console.log("gets here")
        request73.execute(function(response){
            var results = response.result;
            
            
            data = "<iframe class= video width= 640 height=360 src= //www.youtube.com/embed/{{videoid}} frameborder=0 allowfullscreen></iframe>"
            $("#results").append(vidreplace(data, [{"videoid": results.items[0].id.videoId}]))
            
        })
    });
}
function createMenuWithRound() {
    let body = $("body");
    let menuDiv = $("<div class =tab>")
    body.append(menuDiv);
    menuDiv.append("<button class=tablinks id=home>Home</button>");
    //menuDiv.append("<button class=tablinks id=round1>Round-Trip</button>");
    //body.append('</div>');
}
function createMenuAvail(){
    let body = $("body");
    let menuDiv = $("<div class =tab>")
    body.append(menuDiv);
    menuDiv.append("<button class=tablinks id=home>Home</button>");
}
function OpenOneWayInterface() {
    let body = $("body");
    body.empty();
    body.addClass("parallax");
    createMenuWithRound();
    body.append('<h1>Flight Interface</h1>');
    body.append('<br>');
    body.append(oneWayForm);
    $("#destination").val(arrival);
    $("#departure").val(departure);
    $("#firstname").val(fname);
    $("#lastname").val(lname);
    let datalist = `<datalist id = codes></datalist>`;
    $("#infoform").append(datalist);
            
    $('#firstname').keyup(function() {
        fname = $('#firstname').val().toString();
    })
    $('#lastname').keyup(function() {
        lname = $(this).val().toString();
    })
    $('#departure').keyup(function() {
        departure = $(this).val().toString();
    })
    $('#destination').keyup(function() {
        arrival = $(this).val().toString();
    })
    $('#date').keyup(function() {
        date = $('#date').val().toString();
    })
    /*$("#round1").on("click", function () {
        
        OpenRoundInterface();
        
    });*/
    acceptableCodes();
    makeHomeListener();
    makeSubmitListener();
}
function OpenRoundInterface() {
    
    let body = $("body");
    body.empty();
    body.addClass("parallax")
    createMenu();
    
    body.append("<h1>Round Trip Ticket Purchasing Interface </h1>");
    body.append(roundForm);
    let datalist = `<datalist id = codes></datalist>`;
    $("#destination").val(arrival);
    $("#departure").val(departure);
    $("#firstname").val(fname);
    $("#lastname").val(lname);
    $('#firstname').keyup(function() {
        fname = $('#firstname').val().toString();
    })
    $('#lastname').keyup(function() {
        lname = $(this).val().toString();
    })
    $('#departure').keyup(function() {
        departure = $(this).val().toString();
    })
    $('#destination').keyup(function() {
        arrival = $(this).val().toString();
    })
    
    $("#infoform").append(datalist);
    $("#one1").on("click", function () {
        OpenOneWayInterface();
    });
    acceptableCodes();
    makeHomeListener();
    //makeSubmitListener();
}
function makeHomeListener() {
    $("#home").on("click", function () {
        let body = $("body");
        body.empty();
        body.append(firstBody);
        listeners();
    });
}
function acceptableCodes() {
    
    $.ajax(root + "airports",
        {
            type: 'GET',
            dataType: 'JSON',
            xhrFields: { withCredentials: true },
            success: (response) => {
                let rarray = response;
                rarray.forEach(element => {
                    codes.push(element.code);
                    aids[element.code] = element.id;
                    raids[element.id] = [element.code]
                });
                
                codes.forEach(element => {
                    $("#codes").append("<option value =" + element + ">");
                });
            }, error: () => {
                
            }
        });
}
function makeSubmitListener() {
    
    $("#infoSubmit").on("click", function () {
        
        var values = $('#infoform :input');
        grabPossibleOneWayFlights(values);
        
    });
}
function grabPossibleOneWayFlights(values) {
    fname = $('#firstname').val().toString();
    lname = $('#lastname').val().toString();
    departure = $('#departure').val().toString();
    arrival = $('#destination').val().toString();
    date = $("#date").val().toString();
    let arr = codes.includes(arrival);
    let dep = codes.includes(departure);
    let valid = arr && dep;  
    if(!valid){
        alert("DESTINATION OR ARRIVAL CODES IS INVALID")
        return;
    }
    let body = $("body");
    //header = ("<h1>Available Flights from " + $('#departure').val().toString() + " to " + $('#destination').val().toString() + " on " + $('#date').val().toString());
    //body.append(header);
    //body.append("<div id=flights-body></div>");
    $.ajax(root + "flights?filter[departure_id]="+aids[departure]+"&filter[arrival_id]="+aids[arrival],
        {
            type: 'GET',
            dataType: 'JSON',
            xhrFields: { withCredentials: true },
            success: (response1) => {
                body.append(`<table id=availableFlights style="width:100%">
                            <thead>
                            <tr>
                              <th >Flight Number</th>   
                              <th >Departing From</th>
                              <th >Arriving To</th> 
                              <th >Departing At</th>
                            </tr>
                            </thead>
                            <tbody>
                            </tbody>`)
                            var myTable = $("#availableFlights").DataTable({
                                select: 'single',
                                buttons: [
                                    {
                                        extend: 'selectedSingle',
                                        text: 'Log selected data',
                                        action: function ( e, dt, button, config ) {
                                            console.log( dt.row( { selected: true } ).data() );
                                        }
                                    }
                                ]
                            });
                
                console.log(response1);
                response1.forEach(function(e){
                    $.ajax(root+"instances?filter[flight_id]="+e.id+"&filter[date]="+date,{
                        type: 'GET',
                        dataType: 'JSON',
                        xhrFields: { withCredentials: true },
                        success: (response2) =>{
                            
                            response2.forEach(function(e){
                                $.ajax(root+"flights/"+e.flight_id,
                                {
                                    type: 'GET',
                                    dataType: 'JSON',
                                    xhrFields: { withCredentials: true },
                                    success: (response) =>{
            
                                        myTable.row.add([e.flight_id, raids[response.departure_id],raids[response.arrival_id],response.departs_at.toString().slice(11,-1)]).draw()
                                        
                                    }
                                })   
                            });
                            
                        }
                    })
                });
                $("body").append("<button id=check>Check Out</button>");
                makeCheckOutListener(myTable); 
            }   
        })

    
}

