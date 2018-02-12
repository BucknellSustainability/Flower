 //Reads sites from amazon rds
function readDB(readTable, condition, fields){
	var data = [];

	return $.ajax({
	    type: 'GET',
        // TODO: There might be a cleaner way to do this url and different port
	    url: 'http://linuxremote1.bucknell.edu:5000/read',
	    xhrFields: {
            withCredentials: true
        },
        data: {
            table: readTable,
	  	    condition: condition,
	  	    fields: fields
	    },
	    contentType: 'application/json',
    })

};

