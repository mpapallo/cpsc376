// Michaela Papallo
// CPSC 376 Assignment 2

const SERVER = "http://localhost:3000/"
const GALLERY = "/gallery?";
const OBJECT = "/object?";
const auth_err = 'Access Denied: Must be signed in to view results';

function isEmpty(obj) {
  for(var key in obj) {
    if(obj.hasOwnProperty(key)) {return false;}
  }
  return true;
}

/***
fetch functions
***/
async function getData(url){
	//console.log("fetch ", url);
	const response = await fetch(url);
	//console.log(response);
	const json = await response.json();
	//console.log(json);
	return json;
}

async function getSearchData(url){
	let records = [];
	const t = ["Loading", "Loading.", "Loading..", "Loading..."];
	let i = 0;
	let next_page = 1;
	do {
		document.getElementById("results").innerHTML = t[i%4]; //just so you can see that it's working not frozen
		json = await getData(url);
		//console.log(json);
		if (isEmpty(json)) {return null;}
		//console.log(json);
		records = records.concat(json.records);
		next_page = json.info.next;
		if (next_page) {url.searchParams.set('page', next_page);}
		//console.log(url.toString());
		i++;
	} while (next_page); //this could mean a LOT of requests if the search is broad
	return records;
}

/***
display list of galleries
***/
async function viewGalleries(){
	//console.log("button clicked???");
	//retrieve galleries
	const url = new URL(GALLERY, SERVER);
	const data = await getSearchData(url);
	//console.log('data: ', data);
	if (!data) { document.getElementById("results").innerHTML = auth_err; return; }
	//display galleries
	let html = "<table><tr><th colspan='2'>Gallery</th></tr>";
	data.forEach((obj) => {
		let num = obj.gallerynumber;
		let name = (obj.theme ? obj.theme : obj.name);
		html += `<tr><td><input id="gall" type="button" onclick="viewObjectsInGallery(${num}, '${name}')"></td><td>${name}</td></tr>`;
	});
	html += "</table>";
	document.getElementById("results").innerHTML = html;
}

/***
given array of objects, return html string for body of table
***/
function getObjectTable(data){
	let table_body = "";
	data.forEach((obj) => {
		let id = obj.objectid;
		let title = obj.title;
		table_body += `<tr><td><input id="obj" type="button" onclick="viewObjectDetails(${id})"></td><td>${title}</td></tr>`
	});
	return table_body;
}

/***
given gallery number and name, display all objects in gallery
***/
async function viewObjectsInGallery(galnum, name){
	//retrieve objects
	const url = new URL(OBJECT, SERVER);
	url.searchParams.append("gallery", galnum);
	const data = await getSearchData(url);
	if (!data) { document.getElementById("results").innerHTML = auth_err; return; }
	//display objets
	let html = "<table><tr><th colspan='2'>Objects in Gallery: " + name + "</th></tr>";
	html += getObjectTable(data) + "</table>";
	document.getElementById("results").innerHTML = html;
}

/***
given object id, display information of one object
***/
async function viewObjectDetails(id){
	//retrieve object data
	const url = new URL(OBJECT, SERVER);
	url.searchParams.append("q", `objectid:${id}`);
	const data = await getSearchData(url);
	if (!data) { document.getElementById("results").innerHTML = auth_err; return; }
	const obj = data[0];
	let html = "";
	//retrieve images through IIIF
	for (let i in obj.images){
		const base_uri = obj.images[i].iiifbaseuri;
		const json = await getData(base_uri + "/info.json"); //can be slower than loading the rest of the info
		const info = json.profile[1];
		const ext = (info.formats.includes("png") ? "png" : "jpg");
		const full_uri = base_uri + `/full/full/0/native.${ext}`;
		html += `<img src='${full_uri}' width='300' onclick="viewFullImg('${full_uri}')">`;
	}
	//display object properties
	html += "<table><tr><th colspan='2'>Object Details</th></tr>";
	for (let prop in obj){
		if (!obj.hasOwnProperty(prop)){ continue; }
		let val = obj[prop];
		html += `<tr><td>${prop}</td><td>${val}</td></tr>`;
	}
	html += "</table>";
	document.getElementById("results").innerHTML = html;
}

/***
given URI, view full resolution image
***/
function viewFullImg(uri){
	const html = `<img src="${uri}">`
	document.getElementById("results").innerHTML = html;
}

/***
get search parameters and display table of all relevant objects
***/
async function viewObjects(){
	//get obj properties to search
	const url = new URL(OBJECT, SERVER);
	let search_params = {};
	search_params.classification = document.getElementById("classification").value;
	search_params.culture = document.getElementById("culture").value;
	search_params.accessionyear = document.getElementById("year").value;
	search_params.division = document.getElementById("division").value;
	search_params.period = document.getElementById("period").value;
	//build search parameters
	for (let prop in search_params){
		if (!search_params.hasOwnProperty(prop)){ continue; }
		let val = search_params[prop];
		if (!val) { continue; }
		url.searchParams.append("q", `${prop}:${val}`);
	}
	//retrieve and display objects
	const data = await getSearchData(url);
	if (!data) { document.getElementById("results").innerHTML = auth_err; return; }
	html = "<table><tr><th colspan='2'>Objects</th></tr>";
	html += getObjectTable(data) + "</table>";
	document.getElementById("results").innerHTML = html;
}

async function viewPeople(){
	//retrieve people
	const url = new URL('/person', SERVER);
	const name = document.getElementById("displayname").value;
	if (name) {url.searchParams.append("q", `displayname:${name}`);}
	const data = await getSearchData(url);
	if (!data) { document.getElementById("results").innerHTML = auth_err; return; }
	//display people
	let html = "<table><tr><th colspan='2'>People</th></tr>";
	data.forEach((obj) => {
		let num = obj.personid;
		let name = obj.displayname;
		html += `<tr><td><input id="gall" type="button" onclick="viewDetails('/person', 'personid', '${num}')"></td><td>${name}</td></tr>`;
	});
	html += "</table>";
	document.getElementById("results").innerHTML = html;
}

async function viewEx(){
	//retrieve people
	const url = new URL('/exhibition', SERVER);
	const data = await getSearchData(url);
	if (!data) { document.getElementById("results").innerHTML = auth_err; return; }
	//display people
	let html = "<table><tr><th colspan='2'>Exhibitions</th></tr>";
	data.forEach((obj) => {
		let num = obj.id;
		let name = obj.title;
		html += `<tr><td><input id="ex" type="button" onclick="viewDetails('/exhibition', 'id', '${num}')"></td><td>${name}</td></tr>`;
	});
	html += "</table>";
	document.getElementById("results").innerHTML = html;
}

async function viewPub(){
	//retrieve people
	const url = new URL('/publication', SERVER);
	const data = await getSearchData(url);
	if (!data) { document.getElementById("results").innerHTML = auth_err; return; }
	//display people
	let html = "<table><tr><th colspan='2'>Publications</th></tr>";
	data.forEach((obj) => {
		let num = obj.publicationid;
		let name = obj.title;
		html += `<tr><td><input id="ex" type="button" onclick="viewDetails('/publication', 'publicationid', '${num}')"></td><td>${name}</td></tr>`;
	});
	html += "</table>";
	document.getElementById("results").innerHTML = html;
}

async function viewDetails(type, name, id){
	const url = new URL(type, SERVER);
	url.searchParams.append("q", `${name}:${id}`);
	const data = await getSearchData(url);
	//console.log(data);
	if (!data) { document.getElementById("results").innerHTML = auth_err; return; }
	const obj = data[0];
	let html = "";
	html += "<table><tr><th colspan='2'>Details</th></tr>";
	for (let prop in obj){
		if (!obj.hasOwnProperty(prop)){ continue; }
		let val = obj[prop];
		html += `<tr><td>${prop}</td><td>${val}</td></tr>`;
	}
	html += "</table>";
	document.getElementById("results").innerHTML = html;
}
