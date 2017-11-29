// Turned off unused vars becuase it claims that readDB isn't used, but it is
// just used in another file
/* eslint no-unused-vars:"off" */

// TODO: verify this JSDoc with Jordan
/**
 * Reads sites from amazon rds
 * @param {table} readTable - The table to be read from
 * @param {condition} condition - The condition for the query
 * @param {fields} fields - The fields for the query
 * @return {data} data - Data to be returned from the DB
*/
function readDB(readTable, condition, fields) {
    data = [];

    $.ajax({
      type: 'GET',
      url: 'api.php',
      data: {
          table: readTable,
          condition: condition,
          fields: fields,
      },
      contentType: 'application/json',
      async: false, // important. Makes sure init map waits till this is done.
      success: function(json) {
        $.each(JSON.parse(json), function(key, value) {
          data.push(value); // value = json object for site
        });
        console.log('Sucessfully Read Sites from DB');
      },
      error: function() {
        alert('Error Reading from DB');
      },
      });
  return data;
};
