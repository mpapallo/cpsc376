// Michaela Papallo
// CPSC 376 Assignment 1

//my API key: 47f218b0-b5d5-11e8-8c0c-03e1b17d6f1e

// harvard.js post url info to server.js
// server.js does fetch using harvard url and given params and add API key
// harvard.js get info from server.js

// getting "next" and "prev" page, get params but change back to localhost ?
// (sanitize url in server.js bc u dont want api key to get out)
// way to parse url

//to do:
// [ ] multiple requests to get full data
// [ ] authentication

const SERVER = "http://localhost:3000/"
const GALLERY = "/gallery?";
const OBJECT = "/object?";

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
//	const t = ["Loading", "Loading.", "Loading..", "Loading..."];
//	let i = 0;
//	do {
//		document.getElementById("results").innerHTML = t[i%4]; //just so you can see that it's working not frozen
		const json = await getData(url);
		console.log(json.info);
		records = records.concat(json.records);
//		page++; i++;
//		url.searchParams['page'] = page;
//	} while (json.info.next); //this could mean a LOT of requests if the search is broad
	return records;
}

/***
display list of galleries
***/
async function viewGalleries(){
	console.log("button clicked???");
	//retrieve galleries
	const url = new URL(GALLERY, SERVER);
	const data = await getSearchData(url);
	//display galleries
	let html = "<table><tr><th colspan='2'>Gallery</th></tr>";
	data.forEach((obj) => {
		let num = obj.gallerynumber;
		let name = (obj.theme ? obj.theme : obj.name);
		html += `<tr><td><input id="gall" type="button" onclick="viewObjectsInGallery(${num}, '${name}')"></td><td>${name}</td></tr>`;
	});
	html += "</table>";
	console.log("displaying html");
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
	search_params.person = document.getElementById("person").value;
	search_params.exhibition = document.getElementById("exhibition").value;
	search_params.medium = document.getElementById("medium").value;
	//build search parameters
	for (let prop in search_params){
		if (!search_params.hasOwnProperty(prop)){ continue; }
		let val = search_params[prop];
		if (!val) { continue; }
		url.searchParams.append("q", `${prop}:${val}`);
	}
	//retrieve and display objects
	const data = await getSearchData(url);
	html = "<table><tr><th colspan='2'>Objects</th></tr>";
	html += getObjectTable(data) + "</table>";
	document.getElementById("results").innerHTML = html;
}
