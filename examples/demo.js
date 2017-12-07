let Golem = require("../index.js");

console.log("Loading golem ticker articles... please wait");
Golem.getArticles().then(function (articles) {

	console.log("Loading finished. Markdowns saved to ./saves");

}).catch(function (err) {
		console.error("Error loading articles: " + err);
});