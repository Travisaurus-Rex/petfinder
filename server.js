const JSONP       = require('node-jsonp');
const bodyparser  = require('body-parser');
const app         = require('express')();
const key         = 'dd87d1fd77ba16c8fb1e6e819e0b2d41';
const secret      = '569168d86f2d841b895df4d3066d7db1';
const url         = 'https:\//api.petfinder.com';

app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
	res.send('Hello from petfinder!');
})


// ROUTE: GET RANDOM PET
app.get('/random', (req, res) => {
	// request random pet id
	JSONP(`${url}/pet.getRandom?key=${key}&format=json`, json => {

		let id = json.petfinder.petIds.id.$t;
		console.log(id);
		// use id to get pet record
		JSONP(`${url}/pet.get?id=${id}&key=${key}&format=json`, json => {

			let dataToSend = checkPetExists(json);
			res.json(dataToSend);
			
		});
	})
})

// ROUTE: GET SINGLE PET RECORD
app.get('/pet/:id', (req, res) => {

	JSONP(`${url}/pet.get?id=${req.params.id}&key=${key}&format=json`, json => {

		let dataToSend = checkPetExists(json);
		res.send(dataToSend);
		
	});
})

// ROUTE: FIND PETS BY SEARCH
app.post('/pet/find', (req, res) => {

})

// DEBUGGING ROUTE: GET SINGLE PET RECORD
app.get('/pet/console/:id', (req, res) => {
	JSONP(`${url}/pet.get?id=${req.params.id}&key=${key}&format=json`, json => {
		
		console.log(json);
		res.send(json);

	});
})

// ROUTE: GET LIST OF SHELTERS
app.get('/shelter/find/:location', (req, res) => {

})

// ROUTE: GET SINGLE SHELTER RECORD
app.get('/shelter/:location', (req, res) => {
	let location = req.params.location;
})

// ROUTE: GET PETS FROM SINGLE SHELTER
app.get('/shelter/:location/pets', (req, res) => {

})
const port = process.env.PORT || 8080;
app.set('port', port);
app.listen(app.get('port'));

function checkPetExists(pet) {
	if (pet.petfinder.hasOwnProperty('pet')) {
				return cleanPetObj(pet);
			} else {
				return {
					message: 'There was an error because petfinder is shit',
					response: pet
				};
			}
}

function cleanPetObj(data) {
	console.log(data.petfinder.pet);

	let obj = data.petfinder.pet;

	let pet = {
			status: (obj.status) ? obj.status.$t : null,
			contact: {
				phone: (obj.contact.phone) ? obj.contact.phone.$t : null,
				address1: (obj.contact.address1) ? obj.contact.address1.$t : null,
				address2: (obj.contact.address2) ? obj.contact.address2.$t : null,
				city: (obj.contact.city) ? obj.contact.city.$t : null,
				state: (obj.contact.state) ? obj.contact.state.$t : null,
				zip: (obj.contact.zip) ? obj.contact.zip.$t : null,
				email: (obj.contact.email) ? obj.contact.email.$t : null
			},
			id: (obj.id) ? obj.id.$t : null,
			size: (obj.size) ? obj.size.$t : null,
			age: (obj.age) ? obj.age.$t : null,
			name: (obj.name) ? obj.name.$t : null,
			animal: (obj.animal) ? obj.animal.$t : null,
			description: (obj.description) ? obj.description.$t : null,
			mix: (obj.mix) ? obj.mix.$t : null,
			shelterId: (obj.shelterId) ? obj.shelterId.$t : null,
			images: [],
			breeds: [],
		}; 


		if ( checkImages(obj) ) {
			obj.media.photos.photo.forEach(pic => {
				if (pic['@size'] === 'x') {
					pet.images.push(pic.$t);
				}
			})
		}

		if ( checkBreeds(obj) ) {

			if ( Array.isArray(obj.breeds.breed) ) {
				obj.breeds.breed.forEach(breed => {
					pet.breeds.push(breed.$t);
				});
			} else {
				pet.breeds.push(obj.breeds.breed.$t);
			}
		}

		return pet;

}

function checkImages(objWithPhotos) {
	if ( objWithPhotos.hasOwnProperty('media') 
		&& objWithPhotos.media.hasOwnProperty('photos')
		&& objWithPhotos.media.photos.hasOwnProperty('photo')) {
		return true;
	} else {
		return false;
	}
}

function checkBreeds(objWithBreeds) {
	if ( objWithBreeds.hasOwnProperty('breeds')
		&& objWithBreeds.breeds.hasOwnProperty('breed')) {
		return true;
	} else {
		return false;
	}
}
