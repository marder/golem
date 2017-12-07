let Golem = require("../index.js");

console.log("Loading golem ticker articles... please wait");
Golem.getArticles().then(function (articles) {

	var list = require("select-shell")({
		pointer: ' ▸ ',
		pointerColor: 'yellow',
		checked: ' ◉  ',
		unchecked:' ◎  ',
		checkedColor: 'blue',
		msgCancel: 'No selected options!',
		msgCancelColor: 'orange',
		multiSelect: false,
		inverse: true,
		prepend: true
	})

	var stream = process.stdin;

	for (let article of articles) {
		list.option(article.title.split('\n').join(' '), article);
	}

	list.list();

	list.option('select', function (options) {
		console.log(options.content);
		process.exit(0);
	});

	list.option('cancel', function (options) {
		console.log('Cancel list, ' + options.length + ' options selected');
		process.exit(0);
	})

}).catch(function (err) {
		console.error("Error loading articles: " + err);
});