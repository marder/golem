"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sanitize = require("sanitize-filename");
const https = require("https");
const cheerio = require("cheerio");
const path = require("path");
const fs = require("@rammbulanz/afs");
const Validator_1 = require("./Validator");
var Golem;
(function (Golem) {
    async function getArticles() {
        let html = await request("https://www.golem.de/ticker/");
        let articles = [];
        let $ = cheerio.load(html);
        let _articles = $('ol.list-tickers li a');
        for (let i = 0; i < _articles.length; i++) {
            let url = _articles[i].attribs.href;
            try {
                let article = await getArticle(url);
                if (article) {
                    articles.push(article);
                }
            }
            catch (err) {
                console.error(err);
            }
        }
        return articles;
    }
    Golem.getArticles = getArticles;
    async function getArticle(url) {
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
        for (let i = 0; i < contents.length; i++) {
            let p = $(contents[i]);
            content += p.text();
        }
        let article = {
            title: title,
            content: content,
            plainHtml: html,
            url: url,
            features: {
                keywords: [],
                category: ""
            }
        };
        if (!_validateArticle(article)) {
            throw "Article failed validation";
        }
        saveAsMarkdown(article);
        return article;
    }
    Golem.getArticle = getArticle;
    function request(url) {
        return new Promise(function (fulfill, reject) {
            https.get(url, function (res) {
                if (res.statusCode === 200) {
                    let _bufs = [], responseText = "";
                    res.on("data", function (chunk) {
                        if (typeof chunk === "string") {
                            responseText += chunk;
                        }
                        else {
                            _bufs.push(chunk);
                        }
                        ;
                    });
                    res.on("end", function () {
                        if (_bufs.length > 0) {
                            responseText = Buffer.concat(_bufs).toString("utf8");
                        }
                        fulfill(responseText);
                    });
                }
                else {
                    reject(new Error(`${res.statusCode} - ${res.statusMessage}`));
                }
            });
        });
    }
    async function saveAsMarkdown(article) {
        try {
            let folder = path.join(process.cwd(), "saves");
            await fs.mkdirs(folder);
            let file = path.join(folder, sanitize(article.title) + ".md");
            ;
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
        }
        catch (err) {
            console.error(err);
        }
    }
    function _validateArticle(article) {
        return Validator_1.Validator.validate(article, {
            title: "string",
            content: "string",
            plainHtml: "string",
            url: "string",
            features: "object"
        });
    }
})(Golem = exports.Golem || (exports.Golem = {}));

//# sourceMappingURL=../maps/Golem.js.map
