"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
const cheerio = require("cheerio");
const Validator_1 = require("./Validator");
var Golem;
(function (Golem) {
    function getArticles() {
        return new Promise(function (fulfill, reject) {
            https.get("https://www.golem.de/ticker/", function (res) {
                if (res.statusCode === 200) {
                    let _bufs = [], responseText = "";
                    res.on("data", function (chunk) {
                        if (typeof chunk === "string") {
                            responseText += chunk;
                        }
                        else {
                            _bufs.push(chunk);
                        }
                    });
                    res.on("end", function () {
                        if (_bufs.length > 0) {
                            responseText = Buffer.concat(_bufs).toString("utf8");
                        }
                        let articles = [];
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
                            });
                        });
                    });
                }
                else {
                    reject(new Error(`${res.statusCode} - ${res.statusMessage}`));
                }
            });
        });
    }
    Golem.getArticles = getArticles;
    function getArticle(url) {
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
                    });
                    res.on("end", function () {
                        if (_bufs.length > 0) {
                            responseText = Buffer.concat(_bufs).toString("utf8");
                        }
                        let $ = cheerio.load(responseText);
                        // trim trim trim trim trim trim trim
                        let title = $('article header h1').text().trim();
                        let trimmedTitle = "";
                        title.split('\n').forEach(function (line) {
                            trimmedTitle += line.trim() + " ";
                        });
                        title = trimmedTitle.trim();
                        let content = $('article p').text().trim();
                        let article = {
                            title: title,
                            content: content,
                            plainHtml: responseText,
                            url: url,
                            features: {
                                keywords: [],
                                category: ""
                            }
                        };
                        if (_validateArticle(article)) {
                            fulfill(article);
                        }
                        else {
                            reject("Article failed validation");
                        }
                    });
                }
                else {
                    reject(new Error(`${res.statusCode} - ${res.statusMessage}`));
                }
            });
        });
    }
    Golem.getArticle = getArticle;
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
