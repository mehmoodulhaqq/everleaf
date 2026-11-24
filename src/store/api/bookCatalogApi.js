
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes'
const OPEN_LIBRARY_API_URL = 'https://openlibrary.org/search.json'
const OPEN_LIBRARY_WORKS_URL = 'https://openlibrary.org/works'

const googleBaseQuery = fetchBaseQuery({ baseUrl: '' })
const openLibraryBaseQuery = fetchBaseQuery({ baseUrl: '' })

// --------------------------------------------------
// SHARED HELPERS
// --------------------------------------------------

const normalizeText = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '')
    .trim()

const normalizeSearchTerm = (query = '') => {
  const normalized = query.trim()
  const isbn = normalized.replace(/[-\s]/g, '')

  if (/^(?:\d{10}|\d{13})$/.test(isbn)) {
    return `isbn:${isbn}`
  }

  return normalized
}

const isISBN = (query = '') => {
  const isbn = query.trim().replace(/[-\s]/g, '')
  return /^(?:\d{10}|\d{13})$/.test(isbn)
}

const getFirstSentence = (value) => {
  if (Array.isArray(value)) {
    return getFirstSentence(value[0])
  }

  if (typeof value === 'object' && value !== null) {
    return value.value || ''
  }

  return typeof value === 'string' ? value : ''
}

const getGoogleCoverUrl = (imageLinks = {}) => {
  const image =
    imageLinks.extraLarge ||
    imageLinks.large ||
    imageLinks.medium ||
    imageLinks.thumbnail ||
    imageLinks.smallThumbnail ||
    ''

  return image.replace(/^http:/, 'https:')
}

// --------------------------------------------------
// GOOGLE BOOKS NORMALIZATION
// --------------------------------------------------

const normalizeGoogleBook = (item) => {
  const volume = item?.volumeInfo || {}
  const identifiers = volume.industryIdentifiers || []

  return {
    id: item.id || '',

    title: volume.title || 'Untitled book',

    subtitle: volume.subtitle || '',

    author: Array.isArray(volume.authors)
      ? volume.authors.join(', ')
      : 'Unknown author',

    genre:
      Array.isArray(volume.categories) && volume.categories.length > 0
        ? volume.categories[0]
        : 'Uncategorized',

    categories: Array.isArray(volume.categories)
      ? volume.categories
      : [],

    description: volume.description || '',

    totalPages: Number(volume.pageCount) || 0,

    coverUrl: getGoogleCoverUrl(volume.imageLinks),

    publisher: volume.publisher || '',

    publishedDate: volume.publishedDate || '',

    language: volume.language || '',

    averageRating: Number(volume.averageRating) || null,

    ratingsCount: Number(volume.ratingsCount) || 0,

    isbn10:
      identifiers.find((item) => item.type === 'ISBN_10')?.identifier || '',

    isbn13:
      identifiers.find((item) => item.type === 'ISBN_13')?.identifier || '',

    infoLink: volume.infoLink || '',

    previewLink: volume.previewLink || '',

    source: 'Google Books',
  }
}

// --------------------------------------------------
// OPEN LIBRARY NORMALIZATION
// --------------------------------------------------

const normalizeOpenLibraryBook = (item) => {
  const subjects = Array.isArray(item.subject) ? item.subject : []
  const identifiers = Array.isArray(item.isbn) ? item.isbn : []

  const coverUrl = item.cover_i
    ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg`
    : ''

  return {
    id: `openlibrary:${item.key || identifiers[0] || item.cover_i || item.title}`,

    workKey: item.key || '',

    title: item.title || 'Untitled book',

    author: Array.isArray(item.author_name)
      ? item.author_name.join(', ')
      : 'Unknown author',

    genre: subjects[0] || 'Uncategorized',

    categories: subjects,

    description: getFirstSentence(item.first_sentence),

    totalPages: Number(item.number_of_pages_median) || 0,

    coverUrl,

    publisher: Array.isArray(item.publisher)
      ? item.publisher[0] || ''
      : '',

    publishedDate: item.first_publish_year
      ? String(item.first_publish_year)
      : '',

    language: '',

    averageRating: Number(item.ratings_average) || null,

    ratingsCount: Number(item.ratings_count) || 0,

    isbn10: identifiers.find((isbn) => isbn.length === 10) || '',

    isbn13: identifiers.find((isbn) => isbn.length === 13) || '',

    infoLink: item.key
      ? `https://openlibrary.org${item.key}`
      : '',

    previewLink: '',

    source: 'Open Library',
  }
}

const normalizeOpenLibraryWork = (item) => {
  const description = getFirstSentence(item.description)
  const subjects = Array.isArray(item.subjects) ? item.subjects : []

  const coverUrl =
    Array.isArray(item.covers) && item.covers[0] > 0
      ? `https://covers.openlibrary.org/b/id/${item.covers[0]}-L.jpg`
      : ''

  return {
    workKey: item.key || '',

    title: item.title || '',

    description,

    coverUrl,

    publishedDate: item.first_publish_date || '',

    categories: subjects,

    genre: subjects[0] || 'Uncategorized',

    source: 'Open Library',
  }
}

// --------------------------------------------------
// SEARCH QUERY BUILDERS
// --------------------------------------------------

const buildGoogleSearchQuery = (
  query = '',
  category = '',
  searchType = 'general',
) => {
  const normalizedQuery = normalizeSearchTerm(query)
  const searchTerms = []

  if (normalizedQuery) {
    if (searchType === 'author' && !isISBN(query)) {
      searchTerms.push(`inauthor:"${normalizedQuery}"`)
    } else {
      searchTerms.push(normalizedQuery)
    }
  }

  if (category.trim()) {
    searchTerms.push(`subject:${category.trim()}`)
  }

  return searchTerms.join(' ')
}

const buildOpenLibrarySearchQuery = (
  query = '',
  category = '',
  searchType = 'general',
) => {
  const normalizedQuery = normalizeSearchTerm(query)
  const searchTerms = []

  if (normalizedQuery) {
    if (searchType === 'author' && !isISBN(query)) {
      searchTerms.push(`author:"${normalizedQuery}"`)
    } else {
      searchTerms.push(normalizedQuery)
    }
  }

  if (category.trim()) {
    searchTerms.push(`subject:"${category.trim()}"`)
  }

  return searchTerms.join(' ')
}

// --------------------------------------------------
// GOOGLE BOOKS SEARCH REQUEST
// --------------------------------------------------

const searchGoogleBooks = async (
  query,
  category,
  startIndex,
  maxResults,
  searchType,
  api,
  extraOptions,
) => {
  const params = {
    q: buildGoogleSearchQuery(query, category, searchType),
    startIndex,
    maxResults,
    printType: 'books',
    orderBy: 'relevance',
  }

  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY

  if (apiKey) {
    params.key = apiKey
  }

  return googleBaseQuery(
    {
      url: GOOGLE_BOOKS_API_URL,
      params,
    },
    api,
    extraOptions,
  )
}

// --------------------------------------------------
// OPEN LIBRARY SEARCH REQUEST
// --------------------------------------------------

const searchOpenLibrary = async (
  query,
  category,
  startIndex,
  maxResults,
  searchType,
  api,
  extraOptions,
) => {
  const params = {
    q: buildOpenLibrarySearchQuery(query, category, searchType),
    limit: maxResults,
    offset: startIndex,

    fields: [
      'key',
      'title',
      'author_name',
      'first_publish_year',
      'number_of_pages_median',
      'cover_i',
      'subject',
      'isbn',
      'publisher',
      'ratings_average',
      'ratings_count',
      'first_sentence',
    ].join(','),
  }

  return openLibraryBaseQuery(
    {
      url: OPEN_LIBRARY_API_URL,
      params,
    },
    api,
    extraOptions,
  )
}

// --------------------------------------------------
// DUPLICATE DETECTION
// --------------------------------------------------

const getBookMatchKey = (book) => {
  if (book.isbn13) {
    return `isbn13:${normalizeText(book.isbn13)}`
  }

  if (book.isbn10) {
    return `isbn10:${normalizeText(book.isbn10)}`
  }

  return `title-author:${normalizeText(book.title)}-${normalizeText(
    book.author,
  )}`
}

const mergeBooks = (googleBooks, openLibraryBooks) => {
  const bookMap = new Map()

  const addBook = (book) => {
    const key = getBookMatchKey(book)
    const existing = bookMap.get(key)

    if (!existing) {
      bookMap.set(key, book)
      return
    }

    const preferred =
      existing.source === 'Google Books' ? existing : book

    const secondary =
      existing.source === 'Google Books' ? book : existing

    bookMap.set(key, {
      ...secondary,
      ...preferred,

      description:
        preferred.description || secondary.description || '',

      coverUrl:
        preferred.coverUrl || secondary.coverUrl || '',

      totalPages:
        preferred.totalPages || secondary.totalPages || 0,

      publisher:
        preferred.publisher || secondary.publisher || '',

      publishedDate:
        preferred.publishedDate || secondary.publishedDate || '',

      isbn10:
        preferred.isbn10 || secondary.isbn10 || '',

      isbn13:
        preferred.isbn13 || secondary.isbn13 || '',

      workKey:
        preferred.workKey || secondary.workKey || '',

      categories:
        preferred.categories?.length > 0
          ? preferred.categories
          : secondary.categories,

      source: 'Google Books + Open Library',
    })
  }

  googleBooks.forEach(addBook)
  openLibraryBooks.forEach(addBook)

  return Array.from(bookMap.values())
}

// --------------------------------------------------
// REDUX TOOLKIT QUERY API
// --------------------------------------------------

export const bookCatalogApi = createApi({
  reducerPath: 'bookCatalogApi',

  baseQuery: async () => ({
    data: null,
  }),

  endpoints: (builder) => ({
    // SEARCH BOOKS
    searchBooks: builder.query({
      async queryFn(
        {
          query = '',
          category = '',
          startIndex = 0,
          maxResults = 20,
        } = {},
        api,
        extraOptions,
      ) {
        if (!query.trim() && !category.trim()) {
          return {
            data: {
              totalItems: 0,
              items: [],
              source: null,
            },
          }
        }

        const safeMaxResults = Math.min(
          Math.max(Number(maxResults) || 20, 1),
          40,
        )

        const authorSearch = Boolean(query.trim() && !isISBN(query))

        const requests = [
          searchGoogleBooks(
            query,
            category,
            startIndex,
            safeMaxResults,
            'general',
            api,
            extraOptions,
          ),

          searchOpenLibrary(
            query,
            category,
            startIndex,
            safeMaxResults,
            'general',
            api,
            extraOptions,
          ),
        ]

        if (authorSearch) {
          requests.push(
            searchGoogleBooks(
              query,
              category,
              startIndex,
              safeMaxResults,
              'author',
              api,
              extraOptions,
            ),

            searchOpenLibrary(
              query,
              category,
              startIndex,
              safeMaxResults,
              'author',
              api,
              extraOptions,
            ),
          )
        }

        const results = await Promise.all(requests)

        const googleResults = [results[0]]
        const openLibraryResults = [results[1]]

        if (authorSearch) {
          googleResults.push(results[2])
          openLibraryResults.push(results[3])
        }

        const googleBooks = googleResults
          .filter((result) => !result.error)
          .flatMap((result) =>
            Array.isArray(result.data?.items)
              ? result.data.items.map(normalizeGoogleBook)
              : [],
          )

        const openLibraryBooks = openLibraryResults
          .filter((result) => !result.error)
          .flatMap((result) =>
            Array.isArray(result.data?.docs)
              ? result.data.docs.map(normalizeOpenLibraryBook)
              : [],
          )

        const items = mergeBooks(googleBooks, openLibraryBooks)

        const googleTotal = Math.max(
          ...googleResults.map((result) =>
            Number(result.data?.totalItems) || 0,
          ),
          0,
        )

        const openLibraryTotal = Math.max(
          ...openLibraryResults.map((result) =>
            Number(result.data?.numFound) || 0,
          ),
          0,
        )

        const googleFailed = googleResults.every(
          (result) => result.error,
        )

        const openLibraryFailed = openLibraryResults.every(
          (result) => result.error,
        )

        if (googleFailed && openLibraryFailed) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Both book catalogues are unavailable.',
              data: {
                message:
                  'Google Books and Open Library could not load books. Please try again later.',
              },
            },
          }
        }

        return {
          data: {
            totalItems: googleTotal + openLibraryTotal,
            items,
            source:
              googleBooks.length > 0 && openLibraryBooks.length > 0
                ? 'Google Books + Open Library'
                : googleBooks.length > 0
                  ? 'Google Books'
                  : 'Open Library',
          },
        }
      },

      keepUnusedDataFor: 300,
    }),

    // FETCH FULL BOOK DETAILS
    getBookDetails: builder.query({
      async queryFn(book, api, extraOptions) {
        if (!book) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'No book provided.',
            },
          }
        }

        const requests = []

        const isGoogleBook =
          book.id && !book.id.startsWith('openlibrary:')

        if (isGoogleBook) {
          const params = {}
          const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY

          if (apiKey) {
            params.key = apiKey
          }

          requests.push(
            googleBaseQuery(
              {
                url: `${GOOGLE_BOOKS_API_URL}/${encodeURIComponent(book.id)}`,
                params,
              },
              api,
              extraOptions,
            ),
          )
        }

        if (book.workKey) {
          const workId = book.workKey.replace(/^\/works\//, '')

          requests.push(
            openLibraryBaseQuery(
              {
                url: `${OPEN_LIBRARY_WORKS_URL}/${encodeURIComponent(workId)}.json`,
              },
              api,
              extraOptions,
            ),
          )
        }

        if (requests.length === 0) {
          return {
            data: book,
          }
        }

        const results = await Promise.all(requests)

        const googleResult = isGoogleBook ? results[0] : null
        const openLibraryResult = book.workKey
          ? results[isGoogleBook ? 1 : 0]
          : null

        const googleDetails =
          googleResult && !googleResult.error
            ? normalizeGoogleBook(googleResult.data)
            : {}

        const openLibraryDetails =
          openLibraryResult && !openLibraryResult.error
            ? normalizeOpenLibraryWork(openLibraryResult.data)
            : {}

        const googleFailed = !googleResult || Boolean(googleResult.error)
        const openLibraryFailed =
          !openLibraryResult || Boolean(openLibraryResult.error)

        if (googleFailed && openLibraryFailed) {
          return {
            data: book,
          }
        }

        return {
          data: {
            ...book,
            ...openLibraryDetails,
            ...googleDetails,

            description:
              googleDetails.description ||
              openLibraryDetails.description ||
              book.description ||
              '',

            coverUrl:
              googleDetails.coverUrl ||
              openLibraryDetails.coverUrl ||
              book.coverUrl ||
              '',

            totalPages:
              googleDetails.totalPages ||
              book.totalPages ||
              0,

            publisher:
              googleDetails.publisher ||
              book.publisher ||
              '',

            publishedDate:
              googleDetails.publishedDate ||
              openLibraryDetails.publishedDate ||
              book.publishedDate ||
              '',

            categories:
              googleDetails.categories?.length > 0
                ? googleDetails.categories
                : openLibraryDetails.categories?.length > 0
                  ? openLibraryDetails.categories
                  : book.categories || [],

            source:
              googleDetails.id && openLibraryDetails.workKey
                ? 'Google Books + Open Library'
                : googleDetails.id
                  ? 'Google Books'
                  : 'Open Library',
          },
        }
      },

      keepUnusedDataFor: 300,
    }),
  }),
})

export const {
  useSearchBooksQuery,
  useGetBookDetailsQuery,
} = bookCatalogApi
