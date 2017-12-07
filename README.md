# golem

Fetch golem.de/ticker articles

State: In development. NPM module not published yet

# Install

```bash
npm install @rammbulanz/golem
```

# Use

### Include in javascript
```javascript
var Golem = require("@rammbulanz/golem")
```

### Include in typescript
```typescript
import * as Golem from '@rammbulanz/golem'
```

### Fetch articles
```typescript
var articles = await Golem.getArticles();
```

### Fetch artikle
```typescript
var article = await Golem.getArticle("${ARTICLE_URL}");
// Article will be an object like 
{
	meta: {
		url: string,
		date: Date,
		author: string,
		keywords: string[]
	},
	title: string,
	content: string,
	plainHtml: string,
	// Array of URLs
	pictures: string[],
	// Array of URLs
	videos: string[]
}
```