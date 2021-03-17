// COMPONENTS
const Container = ({children}) => `
  <div class="container mx-auto max-w-screen-sm px-4 py-2">
    <ul class="bg-gray-50 rounded-3xl p-2 sm:p-5 xl:p-6">
      ${children}
    </ul>
  </div>
`

const TimelineTopMarker = ({color}) => `
  <svg viewBox="0 0 12 12" class="fill-current w-3 h-3 mr-6 overflow-visible text-${color}-300">
    <circle cx="6" cy="6" r="6" fill="currentColor"></circle>
    <circle cx="6" cy="6" r="11" fill="none" stroke="currentColor" stroke-width="2"></circle>
    <path d="M 6 18 V 500" fill="none" stroke-width="2" stroke="currentColor" class="text-gray-200"></path>
  </svg>
`

const TimelineMarker = ({color}) => `
  <svg viewBox="0 0 12 12" class="fill-current w-3 h-3 mr-6 overflow-visible text-${color}-300">
    <circle cx="6" cy="6" r="6" fill="currentColor"></circle>
    <path d="M 6 -6 V -30" fill="none" stroke-width="2" stroke="currentColor" class="text-gray-200"></path>
    <path d="M 6 18 V 500" fill="none" stroke-width="2" stroke="currentColor" class="text-gray-200"></path>
  </svg>
`

const TimelineEvent = ({time, title, body, marker, aside}) => `
  <li>
    <article class="grid md:grid-cols-8 xl:grid-cols-9 items-start relative rounded-xl p-3 sm:p-5 xl:p-6 overflow-hidden hover:bg-white">
      <h3 class="font-semibold text-gray-900 md:col-start-3 md:col-span-6 xl:col-start-3 xl:col-span-7 mb-1 ml-9 md:ml-0">
       ${title}
      </h3>
      <time datetime="${time}" class="md:col-start-1 md:col-span-2 row-start-1 md:row-end-3 flex items-center font-medium mb-1 md:mb-0">
        ${marker}
        ${time}
      </time>
      <p class="md:col-start-3 md:col-span-6 xl:col-span-7 ml-9 md:ml-0 text-gray-600">
        ${body}
      </p>
    </article>
  </li>
`
// ${aside ? `<div class="col-start-9 row-start-1 row-end-7">${aside}</div>` : ``}

const BookTitle = ({title}) => `Libro <span class="text-blue-400">${title}</span>`
const BookBody = ({body}) => `Por <span class="text-blue-400">${body}</span> fue publicado por primera vez`

// HTML
function toElement(html) {
  var element = document.createElement("div")
  element.innerHTML = html

  return element.firstElementChild
}

function loadAndRender({target}) {
  loadBooks()
    .then(books => books.map((b, i) => renderBook(b, i===0)))
    .then(books =>
      toElement(
        Container({
          children: books.join('')
        })))
    .then(element => target.appendChild(element))
}

function loadBooks() {
  var authors = load("db/authors.json").then(r => r.authors)
  var books = load("db/books.json").then(r => r.books)

  return Promise.all([authors, books]).then(([authors, books]) => {
    authors = authors.reduce((map, author) => (map[author.id] = author, map), {})
    return books
      .sort(sortByPublishedDesc)
      .map(b => (b.authors = b.authors.map((a) => authors[a.ref]), b))
  })
}

function sortByPublishedDesc(bookA, bookB) {
  return Number(bookB.published[0]) - Number(bookA.published[0]);
}

function load(url, mapping) {
  return fetch(url).then(r => r.json());
}

function hash(text) {
  return Math.abs(text.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0));
}

function getColor(text) {
  const colors = ['red', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink'];
  return colors[hash(text) % colors.length];
}

function renderBook(book, isFirst) {
  const cover = book.images && book.images[0] && book.images[0].replace("db://", "db/")
  const color = getColor("book")

  return TimelineEvent({
    marker: isFirst
      ? TimelineTopMarker({color})
      : TimelineMarker({color}),
    time: safe(book.published[0]),
    title: BookTitle({title: safe(book.title)}),
    body: BookBody({body: safe(book.authors[0].names[0])}),
    aside: cover ? `<img src="${cover}" alt="cover">` : ``
  });
}

function safe(raw) {
  var element = document.createElement("div")
  element.innerText = raw

  return element.innerText
}
