const fs = require('fs');

var code_string = '';
var current_col;
var configuration;

fs.readFile('config.json','utf-8',function(err,data){
	if (err){
		console.log(err);
		return;
	}
	configuration = JSON.parse(data);
	if (configuration.host == '' || configuration.port == '' || configuration.db == ''){
		console.log('Configuration File has no host, port or db specified. Aborting.');
		return;
	}
	if (configuration.collections.length == 0){
		console.log('Configuration file has no specified collection data. Aborting.');
		return;
	}

	console.log('Setting up connection configuration');
	code_string += 'var db = connect("'+configuration.host+':'+configuration.port+'/'+configuration.db+'");\n';

	console.log()
	console.log('Setting up collection configuration');
	for (var i = 0; i < configuration.collections.length; i++){
		current_col = configuration.collections[i];
		console.log()

		console.log('Create collection - '+current_col.name);
		code_string += '\n//'+current_col.name+'\ndb.createCollection("'+current_col.name+'");\n'
		
		console.log('Adding instantation document to script');
		code_string += 'db.'+current_col.name+'.insert('+JSON.stringify(current_col.instantiationDocument)+');\n';

		console.log('Adding collection indeces to script');
		for (var j=0; j < current_col.indeces.length; j++){
			code_string += 'db.'+current_col.name+'.createIndex('+JSON.stringify(current_col.indeces[j])+');\n';
		}
		code_string += 'db.'+current_col.name+'.remove({})\n';

		console.log('Check for seeded documents');
		if (current_col.seeding){
			console.log('Adding seeds to script');
			for(var k =0; k < current_col.seeding_documents.length; k++){
				code_string += 'db.'+current_col.name+'.insert('+JSON.stringify(current_col.seeding_documents[k])+');\n';
			}
		}
	}


	console.log('Producing output')
	fs.writeFile('./output/install.js',code_string,'utf-8',function(err,data){
		if(err){
			console.log('Write Error');
			console.log(err)
			return;
		}
		console.log('Output generated - please retrieve your installation script from ./output/install.js');
		console.log('Run this script using the mongo shell script tools.')
	})

})