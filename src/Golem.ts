import * as sanitize from 'sanitize-filename';
import * as https from 'https';
import * as cheerio from 'cheerio';
import * as path from 'path';
import * as fs from '@rammbulanz/afs';
import { Validator } from './Validator'
import * as os from 'os';

export namespace Golem {

	export interface Article {
		title: string
		content: string
		url: string
		plainHtml: string
		features: {
			keywords: string[],
			category: string
		}
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

		// trim trim trim trim trim trim trim
		let title = $('article header h1').text().trim();
		let trimmedTitle = "";
		title.split('\n').forEach(function (line) {
			trimmedTitle += line.trim() + " ";
		});
		title = trimmedTitle.trim();

		let contents = $('article p');
		let content = "";
		for (let i=0; i<contents.length; i++) {
			let p = $(contents[i]);
			content += p.text();
		}

		let article: Article = {
			title: title,
			content: content,
			plainHtml: html,
			url: url,
			features: {
				keywords: [] as string[],
				category: ""
			}
		};

		if (!_validateArticle(article)) {
			throw "Article failed validation";
		}

		saveAsMarkdown(article);

		return article;

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

			let file = path.join(folder, sanitize(article.title) + ".md");;

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

		} catch (err) {
			console.error(err);
		}
	}

	function _validateArticle(article: Article) {
		return Validator.validate(article, {
			title: "string",
			content: "string",
			plainHtml: "string",
			url: "string",
			features: "object"
		});
	}

}