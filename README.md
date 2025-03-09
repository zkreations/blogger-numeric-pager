# blogger-numeric-pager

<img src="https://raw.githubusercontent.com/zkreations/blogger-numeric-pager/main/logo.png" align="left" />

![V](https://img.shields.io/npm/v/blogger-numeric-pager) ![L](https://img.shields.io/npm/l/blogger-numeric-pager)

**Blogger Numeric Pager** is an advanced pagination for Blogger that also works in searches. It stores processed data locally and only updates if the blog changes.

## Features

- **Numeric pagination**: Displays numeric pagination with the number of pages.
- **First and Last**: Shows the first and last pages.
- **Works in searches**: The first numeric pagination for Blogger that works even in searches.
- **Blogger integration**: Works with Blogger's native Next and Previous links.
- **Local cache**: Stores processed data locally.
- **Updates**: Only updates if the blog changes.
- **Customizable**: Customize its appearance via CSS.

## Requirements

- The blog must be public and have feeds enabled.
- Posts must correctly include the `<!--more-->` jump break.

## Installation

### npm

```bash
npm i blogger-numeric-pager
```

### cdn

```html
<script src="https://cdn.jsdelivr.net/npm/blogger-numeric-pager@1/dist/main.min.js" defer></script>
```

## How to use

You can use **blogger-numeric-pager** as an ES6 module or as a global script. For example:

```javascript
import BloggerPager from 'blogger-numeric-pager'

const pager = new BloggerPager()
pager.init()
```

If you are using it as a global script, you can access it via the `BloggerPager` global variable:

```javascript
const pager = new BloggerPager()
pager.init()
```

 Now, you need create a container for the pagination (with the id `blog-pager` by default) and another for the numbers (with the id `pager-numbers` by default). For example:

```html
<div id="blog-pager">
  <div id="pager-numbers"></div>
</div>
```

## Options

You can customize **blogger-numeric-pager** by passing an options object to the constructor. Available options are:

| Option                | Type    | Description                                      | Default                |
|-----------------------|---------|--------------------------------------------------|------------------------|
| `pagerSelector`       | string  | Selector for the pagination container            | `#blog-pager`          |
| `numberSelector`      | string  | Selector for the pagination numbers container    | `#pager-numbers`       |
| `numberClass`         | string  | CSS class for pagination numbers                 | `pager-item`           |
| `dotsClass`           | string  | CSS class for the dots (ellipsis)                | `pager-dots`           |
| `activeClass`         | string  | CSS class for active numbers                     | `is-active`            |
| `totalVisibleNumbers` | number  | Number of visible pagination numbers             | `5`                    |
| `checkForUpdates`     | boolean | Checks for blog changes to rebuild pagination    | `true`                 |

For example, to customize the number of visible pagination links and disable update checking:

```javascript
const pager = new BloggerPager({
  totalVisibleNumbers: 7,
  checkForUpdates: false
})

pager.init()
```

## Methods

All methods are available through the instance of `BloggerPager`:

| Method     | Description                   | Returns |
|------------|-------------------------------|---------|
| `init()`   | Initializes the pagination    | [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) |


## Supporting

If you want to help me keep this and other related projects always up to date, you can [buy me a coffee](https://ko-fi.com/zkreations) ☕. I will be very grateful 👏.

## License

**blogger-numeric-pager** is licensed under the MIT License
