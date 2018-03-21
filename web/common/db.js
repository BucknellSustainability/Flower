 //Reads sites from amazon rds
function readDB(readTable, fields, condition_fields, condition_values){
	var data = [];

	return $.ajax({
	    type: 'GET',
        // TODO: There might be a cleaner way to do this url and different port
        // TODO: change this over to one js function call with all other ones
	    url: deploy_config["FLASK_SERVER"] + '/read?fields=' + fields + '&table=' + readTable + '&condition_fields=' + condition_fields + '&condition_values=' + condition_values,
	    xhrFields: {
            withCredentials: true
        },
	contentType: 'application/json',
    })

};

