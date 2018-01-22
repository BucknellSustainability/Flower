 //Reads sites from amazon rds
function readDB(readTable, condition, fields){
	var data = [];

	$.ajax({
	  type: 'GET',
	  url: 'db.php',
	  data: {
	  	table: readTable,
	  	condition: condition,
	  	fields: fields
	  },
	  contentType: 'application/json',
	  async: false,  //important. Makes sure init map waits till this is done.
	  success: function(json) {
	    $.each(JSON.parse(json), function(key,value) {
	      data.push(value); //value = json object for site
	    });
	    console.log("Sucessfully Read Sites from DB");
	  },
	  error: function() {
	    alert('Error Reading from DB');
	  }
	  });
	  return data;
};
