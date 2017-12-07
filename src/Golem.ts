import * as sanitize from 'sanitize-filename';
import * as https from 'https';
import * as cheerio from 'cheerio';
import * as path from 'path';
import * as fs from '@rammbulanz/afs';
import * as os from 'os';

export namespace Golem {

	export interface Article {
		meta: {
			url: string,
			date: Date,
			author: string,
			keywords: string[]
		},
		title: string
		content: string
		plainHtml: string
		pictures: string[]
		videos: string[]
	}

	export async function getArticles() {

		let html = await request("https://www.golem.de/ticker/");

		let articles: Article[] = [];
		let $ = cheerio.load(html);

		let _articles = $('ol.list-tickers li a');

		for (let i = 0; i < _articles.length; i++) {

			let url = _articles[i].attribs.href;

			try {

				let article = await getArticle(url);
				if (article) {
					articles.push(article);
				}

			} catch (err) {
				console.error(err);
			}

		}

		return articles;
	}

	export async function getArticle(url) {

		let html = await request(url);
		let $ = cheerio.load(html);

		let article: Article = {
			meta: {
				url: url,
				author: null,
				date: new Date(),
				keywords: []
			},
			title: "",
			content: "",
			plainHtml: html,
			pictures: [],
			videos: []
		};

		_pickMetadata(article, $);
		_pickTitle(article, $);
		_pickTextContent(article, $);
		_pickPictures(article, $);
		_pickVideos(article, $);

		saveAsMarkdown(article);

		return article;

	}

	function _pickTitle(article: Article, $: CheerioStatic) {

		let title = $('article header h1').text().trim();
		let trimmedTitle = "";

		title.split('\n').forEach(function (line) {
			trimmedTitle += line.trim() + " ";
		});

		article.title = trimmedTitle.trim();

	}
	function _pickTextContent(article: Article, $: CheerioStatic) {

		let contents = $('article p');
		let content = "";

		for (let i = 0; i < contents.length; i++) {
			content += $(contents[i]).text();
		}

		article.content = content;

	}
	function _pickPictures(article: Article, $: CheerioStatic) {

		let pictures = $("article img");

		for (let i = 0; i < pictures.length; i++) {

			let pic = pictures[i].attribs.src;

			if (pic) {
				article.pictures.push(pic);
			}

		}

	}
	function _pickVideos(article: Article, $: CheerioStatic) {

		let videos = $("article p video");

		for (let i = 0; i < videos.length; i++) {

			let video = videos[i].attribs.src;

			if (video) {
				article.videos.push(video);
			}

		}

	}
	function _pickMetadata(article: Article, $: CheerioStatic) {

		// Read article release date
		let date = $('aside time').text();
		article.meta.date = new Date(Date.parse(date));

		// Read author name
		let author = $('aside [rel=author]').text();
		article.meta.author = author;

		// Read keywords
		$('aside a[title]').each(function (index, element) {
			article.meta.keywords.push($(element).text());
		});

	}

	function request(url: string): Promise<string> {
		return new Promise(function (fulfill, reject) {

			https.get(url, function (res) {

				if (res.statusCode === 200) {

					let _bufs = [], responseText = "";

					res.on("data", function (chunk) {
						if (typeof chunk === "string") {
							responseText += chunk;
						} else { _bufs.push(chunk) };
					});

					res.on("end", function () {

						if (_bufs.length > 0) {
							responseText = Buffer.concat(_bufs).toString("utf8");
						}

						fulfill(responseText);

					});

				} else {
					reject(new Error(`${res.statusCode} - ${res.statusMessage}`));
				}

			})

		});
	}

	async function saveAsMarkdown(article: Article) {

		try {

			let folder = path.join(process.cwd(), "saves");
			await fs.mkdirs(folder);

			let name = sanitize(article.title);
			let file = path.join(folder, name + ".md");

			if (await fs.exists(file)) {
				await fs.unlink(file);
			}

			let writeStream = fs.createWriteStream(file, {
				flags: 'w',
				encoding: 'utf8'
			});

			writeStream.write("# " + article.title + '\n\n');
			writeStream.write(article.content);

			writeStream.end();

			let jsonFile = path.join(folder, name + ".json");
			if (await fs.exists(jsonFile)) {
				await fs.unlink(jsonFile);
			}
			await fs.writeFile(jsonFile, JSON.stringify(article, undefined, 2), "utf8");

		} catch (err) {
			console.error(err);
		}
	}

}