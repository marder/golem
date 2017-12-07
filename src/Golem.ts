import * as https from 'https';
import * as cheerio from 'cheerio';

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

	export function getArticles(): Promise<Article[]> {
		return new Promise(function (fulfill, reject) {
			https.get("https://www.golem.de/ticker/", function (res) {

				if (res.statusCode === 200) {

					let _bufs = [], responseText = "";

					res.on("data", function (chunk) {

						if (typeof chunk === "string") {
							responseText += chunk;
						} else {
							_bufs.push(chunk);
						}

					});

					res.on("end", function () {

						if (_bufs.length > 0) {
							responseText = Buffer.concat(_bufs).toString("utf8");
						}

						let articles: Article[] = [];
						let $ = cheerio.load(responseText);


						let $_Articles = $('ol.list-tickers li a');
						let numArticles = $_Articles.length;
						let numParsedArticles = 0;

						$_Articles.each(function (index, element) {
							let url = element.attribs.href;
							getArticle(url).then(function (article) {

								numParsedArticles++;

								if (article)
									articles.push(article);

								if (numParsedArticles === numArticles) {
									fulfill(articles);
								}

							})
						});

					});

				} else {
					reject(new Error(`${res.statusCode} - ${res.statusMessage}`));
				}

			});

		});

	}

	export function getArticle(url: string): Promise<Article> {
		return new Promise(function (fulfill, reject) {

			https.get(url, function (res) {

				if (res.statusCode === 200) {

					let _bufs = [], responseText = "";

					res.on("data", function (chunk) {

						if (typeof chunk === "string") {
							responseText += chunk;
						} else {
							_bufs.push(chunk);
						}

					})

					res.on("end", function () {

						if (_bufs.length > 0) {
							responseText = Buffer.concat(_bufs).toString("utf8");
						}

						let $ = cheerio.load(responseText);

						let title = $('article header h1').text().trim();
						let content = $('article p').text().trim()

						let article: Article = {
							title: title,
							content: content,
							plainHtml: responseText,
							url: url,
							features: {
								keywords: [] as string[],
								category: ""
							}
						};

						fulfill(article);

					})

				} else {
					reject(new Error(`${res.statusCode} - ${res.statusMessage}`));
				}

			});

		})
	}

	function _validateArticle(article: Article) {

	}

}