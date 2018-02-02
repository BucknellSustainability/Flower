 //Reads sites from amazon rds
function readDB(readTable, condition, fields){
	var data = [];

	return $.ajax({
	  type: 'GET',
	  url: 'common/php/db.php',
	  data: {
	  	table: readTable,
	  	condition: condition,
	  	fields: fields
	  },
	  contentType: 'application/json',
	  })

};
