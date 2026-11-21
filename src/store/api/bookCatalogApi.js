import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes'

const OPEN_LIBRARY_API_URL = 'https://openlibrary.org/search.json'

const googleBaseQuery = fetchBaseQuery({
  baseUrl: '',
})

const openLibraryBaseQuery = fetchBaseQuery({
  baseUrl: '',
})

// --------------------------------------------------
// GOOGLE BOOKS NORMALIZATION
// --------------------------------------------------

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

const normalizeGoogleBook = (item) => {
  const volume = item?.volumeInfo || {}
  const identifiers = volume.industryIdentifiers || []

  return {
    id: item.id || '',
    title: volume.title || 'Untitled book',

    author: Array.isArray(volume.authors)
      ? volume.authors.join(', ')
      : 'Unknown author',

    genre:
      Array.isArray(volume.categories) && volume.categories.length > 0
        ? volume.categories[0]
        : 'Uncategorized',

    categories: Array.isArray(volume.categories) ? volume.categories : [],

    description: volume.description || '',
    totalPages: Number(volume.pageCount) || 0,
    coverUrl: getGoogleCoverUrl(volume.imageLinks),

    publisher: volume.publisher || '',
    publishedDate: volume.publishedDate || '',
    language: volume.language || '',

    averageRating: Number(volume.averageRating) || null,
    ratingsCount: Number(volume.ratingsCount) || 0,

    isbn10:
      identifiers.find((identifier) => identifier.type === 'ISBN_10')
        ?.identifier || '',

    isbn13:
      identifiers.find((identifier) => identifier.type === 'ISBN_13')
        ?.identifier || '',

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

  const coverUrl = item.cover_i
    ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`
    : ''

  const identifiers = Array.isArray(item.isbn) ? item.isbn : []

  return {
    id: `openlibrary:${item.key || identifiers[0] || item.cover_i || item.title}`,

    title: item.title || 'Untitled book',

    author: Array.isArray(item.author_name)
      ? item.author_name.join(', ')
      : 'Unknown author',

    genre: subjects[0] || 'Uncategorized',
    categories: subjects,

    description: '',

    totalPages: Number(item.number_of_pages_median) || 0,

    coverUrl,

    publisher: Array.isArray(item.publisher) ? item.publisher[0] || '' : '',

    publishedDate: item.first_publish_year
      ? String(item.first_publish_year)
      : '',

    language: '',

    averageRating: Number(item.ratings_average) || null,
    ratingsCount: Number(item.ratings_count) || 0,

    isbn10: identifiers.find((isbn) => isbn.length === 10) || '',

    isbn13: identifiers.find((isbn) => isbn.length === 13) || '',

    infoLink: item.key ? `https://openlibrary.org${item.key}` : '',

    previewLink: '',

    source: 'Open Library',
  }
}

// --------------------------------------------------
// SEARCH QUERY HELPERS
// --------------------------------------------------

const normalizeSearchTerm = (query = '') => {
  const normalized = query.trim()
  const isbn = normalized.replace(/[-\s]/g, '')

  if (/^(?:\d{10}|\d{13})$/.test(isbn)) {
    return `isbn:${isbn}`
  }

  return normalized
}

const buildGoogleSearchQuery = (query = '', category = '') => {
  const searchTerms = []

  const normalizedQuery = normalizeSearchTerm(query)

  if (normalizedQuery) {
    searchTerms.push(normalizedQuery)
  }

  if (category.trim()) {
    searchTerms.push(`subject:${category.trim()}`)
  }

  // Spaces are correctly encoded by fetchBaseQuery.
  return searchTerms.join(' ')
}

const buildOpenLibrarySearchQuery = (query = '', category = '') => {
  const searchTerms = []

  const normalizedQuery = normalizeSearchTerm(query)

  if (normalizedQuery) {
    searchTerms.push(normalizedQuery)
  }

  if (category.trim()) {
    searchTerms.push(`subject:"${category.trim()}"`)
  }

  return searchTerms.join(' ')
}

// --------------------------------------------------
// GOOGLE BOOKS REQUEST
// --------------------------------------------------

const searchGoogleBooks = async (
  query,
  category,
  startIndex,
  maxResults,
  baseQuery,
  api,
  extraOptions,
) => {
  const params = {
    q: buildGoogleSearchQuery(query, category),
    startIndex,
    maxResults,
    printType: 'books',
    orderBy: 'relevance',
  }

  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY

  if (apiKey) {
    params.key = apiKey
  }

  return baseQuery(
    {
      url: GOOGLE_BOOKS_API_URL,
      params,
    },
    api,
    extraOptions,
  )
}

// --------------------------------------------------
// OPEN LIBRARY FALLBACK REQUEST
// --------------------------------------------------

const searchOpenLibrary = async (
  query,
  category,
  maxResults,
  baseQuery,
  api,
  extraOptions,
) => {
  const searchQuery = buildOpenLibrarySearchQuery(query, category)

  return baseQuery(
    {
      url: OPEN_LIBRARY_API_URL,
      params: {
        q: searchQuery,
        limit: maxResults,
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
        ].join(','),
      },
    },
    api,
    extraOptions,
  )
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
    searchBooks: builder.query({
      async queryFn(
        { query = '', category = '', startIndex = 0, maxResults = 20 } = {},
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

        // 1. Try Google Books first.
        const googleResult = await searchGoogleBooks(
          query,
          category,
          startIndex,
          maxResults,
          googleBaseQuery,
          api,
          extraOptions,
        )

        if (!googleResult.error) {
          const googleItems = Array.isArray(googleResult.data?.items)
            ? googleResult.data.items
            : []

          // Use Google results when available.
          if (googleItems.length > 0) {
            return {
              data: {
                totalItems: Number(googleResult.data?.totalItems) || 0,

                items: googleItems.map(normalizeGoogleBook),

                source: 'Google Books',
              },
            }
          }
        }

        // 2. Google failed or returned no results.
        // Try Open Library.
        const openLibraryResult = await searchOpenLibrary(
          query,
          category,
          maxResults,
          openLibraryBaseQuery,
          api,
          extraOptions,
        )

        if (!openLibraryResult.error) {
          const openLibraryItems = Array.isArray(openLibraryResult.data?.docs)
            ? openLibraryResult.data.docs
            : []

          return {
            data: {
              totalItems: Number(openLibraryResult.data?.numFound) || 0,

              items: openLibraryItems.map(normalizeOpenLibraryBook),

              source: 'Open Library',
            },
          }
        }

        // 3. Both providers failed.
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
      },

      keepUnusedDataFor: 300,
    }),
  }),
})

export const { useSearchBooksQuery } = bookCatalogApi
