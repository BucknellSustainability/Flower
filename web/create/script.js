//jQuery time
var current_fs, next_fs, previous_fs;//fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches

//Index for progress bar
const SITE_SELECT = 0;
const PROJECT_SELECT = 1;
const SENSOR_SELECT = 2;
const GRAPH_SELECT = 3;

//Load sites initially
window.onload = function() { loadOptions("site","", "*","siteGroup","siteRadios","siteId","radio"); }

//handle "next" action button click
$(".next").click(function(){
	if(animating) return false;
	animating = true;

	current_fs = $(this).parent();
	next_fs = $(this).parent().next(); //new field set after clicked next

	var currFieldSet = $('fieldset').index(next_fs);
	var success; var condition; var fields;

	if (currFieldSet == PROJECT_SELECT){
		condition = "WHERE siteId = " + $('input[name=siteGroup]:checked').val();
		fields = "*";
		success = loadOptions("project",condition, fields, "projectGroup","projectRadios","projectId","radio");
		if(!success) {document.getElementById("projectNext").disabled = true;} //disable next button if no data sucessfully loaded
	}
	else if (currFieldSet == SENSOR_SELECT){
		condition = "WHERE projectId = " + $('input[name=projectGroup]:checked').val();
		fields = "*"
		success = loadOptions("sensor",condition, fields, "sensorGroup","sensorRadios","sensorId","checkbox");
		if(!success) {document.getElementById("sensorNext").disabled = true;} //disable next button if no data sucessfully loaded
	}
	else if (currFieldSet == GRAPH_SELECT){
		var charts = document.getElementById("viewBox");
		while (charts.firstChild) {	//remove previous displayed chart (if exists)
		    charts.removeChild(charts.firstChild);
		}

		var sensors = [] //get all sensor checkboxes selected
		$("input:checkbox[name=sensorGroup]:checked").each(function(){
		    sensors.push($(this).val());
		});

		//generate the iframe based on current url
		var url = document.URL.substr(0,document.URL.lastIndexOf('/')) + "/visualize.html?id=" + sensors;
		if (-1 != url.search("http://")){
			url = url.slice(0,4) + 's' + url.slice(4,url.length+1); // Turn http to https
		}	// TODO: This is hacky
		var iframe = document.createElement('iframe');
		iframe.id="iframe1";
		iframe.setAttribute("src", url);
		iframe.width="100%";
		iframe.height="400px";
		iframe.scrolling="no";

		//place iframe into html container
		document.getElementById("viewBox").appendChild(iframe);
		//add iframe text element
		var iframeTextareaHTML = document.getElementById("iframeTxtHTML");
		iframeTextareaHTML.textContent = iframe.outerHTML;

		var iframeTextareaWP = document.getElementById("iframeTxtWP");
		iframeTextareaWP.textContent = "[iframe id=iframe1 src=" + url + " scrolling="no" width=100% height=400px]";
	}

	//activate next step on progressbar using the index of next_fs
	$("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
	next_fs.show();

	//hide the current fieldset with style
	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale current_fs down to 80%
			scale = 1 - (1 - now) * 0.2;
			//2. bring next_fs from the right(50%)
			left = (now * 50)+"%";
			//3. increase opacity of next_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({'transform': 'scale('+scale+')'});
			next_fs.css({'left': left, 'opacity': opacity});
		},
		duration: 500,
		complete: function(){
			current_fs.hide();
			animating = false;
		},
		//this comes from the custom easing plugin
		easing: 'easeOutQuint'
	});
	var active_val = $('ul#progressbar').find('li.active')

});

//handles "previous" action button clicks
$(".previous").click(function(){
	if(animating) return false;
	animating = true;

	current_fs = $(this).parent();
	previous_fs = $(this).parent().prev();

	//de-activate current step on progressbar
	$("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

	//show the previous fieldset
	previous_fs.show();
	//hide the current fieldset with style
	current_fs.animate({opacity: 0}, {
		step: function(now, mx) {
			//as the opacity of current_fs reduces to 0 - stored in "now"
			//1. scale previous_fs from 80% to 100%
			scale = 0.8 + (1 - now) * 0.2;
			//2. take current_fs to the right(50%) - from 0%
			left = ((1-now) * 50)+"%";
			//3. increase opacity of previous_fs to 1 as it moves in
			opacity = 1 - now;
			current_fs.css({'left': left});
			previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
		},
		duration: 500,
		complete: function(){
			current_fs.hide();
			animating = false;
		},
		//this comes from the custom easing plugin
		easing: 'easeOutQuint'
	});
});

$(".submit").click(function(){
	return false;
})

/*
loadOptions - reads database and creates html input elements based on data found in db. (Populates site, project and sensor radio buttons)
returns @success boolean false if no html input elements were created.
*/
 function loadOptions(table, condition, fields, group, div, idField, type){
 		//remove radio elements that might already exists
		var radioGroup = document.getElementById(div);
		while (radioGroup.firstChild) {
		    radioGroup.removeChild(radioGroup.firstChild);
		}

		//create list of options in correct container
 		radioList = readDB(table, condition, fields);
	     for (var i in radioList) {
	        var currRadio = radioList[i];

			var radio1 = document.createElement('input');
			radio1.id = i;
			radio1.type = type;
			radio1.name = group;
			radio1.value = currRadio[idField];

			var label1 = document.createElement('label');
			label1.htmlFor = radio1.id;
			$(label1).append(radio1);
			$(label1).append(currRadio.name + ": " + currRadio.description);

			var container = document.getElementById(div);
			$(container).append(label1);
		}

		//determine if any radio buttons were created. If not do not allow the user to move on
		if (radioList.length > 0){ return true}
		else { return false }

 }


//DISABLE BUTTONS UNTIL USER MAKES AN INPUT OPTION SELECTION
$(document).on('click', '[name="siteRadios"]', function () {
    document.getElementById("siteNext").disabled = false;
});
$(document).on('click', '[name="projectRadios"]', function () {
    document.getElementById("projectNext").disabled = false;
});
$(document).on('click', '[name="sensorRadios"]', function () {
    document.getElementById("sensorNext").disabled = false;
});
