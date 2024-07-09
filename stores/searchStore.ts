import Fuse from 'fuse.js'

type SearchFuseType = Fuse<{
  date: string
  title: string
  description: string
  type?: string | undefined
}>

export const useSearchStore = defineStore('search-store', () => {
  const appStore = useAppStore()
  const { arrayDataset } = storeToRefs(appStore)
  const highlightedDates = ref<string[]>([])

  const fuseRef = ref<SearchFuseType | null>(null)

  const indexDataset = () => {
    fuseRef.value = new Fuse(arrayDataset.value, {
      isCaseSensitive: false,
      includeScore: true,
      minMatchCharLength: 3,
      ignoreLocation: true,
      threshold: 0.4,
      keys: [
        {
          name: 'title',
          weight: 2,
        },
        'description',
        'date',
      ],
    })
  }

  const searchValue = ref('')
  const searchResults = ref<typeof arrayDataset.value>([])

  const computeHighlightedDates = () => {
    highlightedDates.value = searchResults.value.map(result => result.date)
  }

  watchDebounced([searchValue], () => {
    if (!searchValue.value || fuseRef.value === null) {
      searchResults.value = []
      highlightedDates.value = []
      return
    }
    // Check if the value is YYYY-MM-DD
    if (searchValue.value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      searchResults.value = []
      highlightedDates.value = [searchValue.value]
      return
    }

    const results = fuseRef.value.search(searchValue.value)
    // console.log(results);
    const tenResults = results.filter(el => (el.score || 1) < 0.3).slice(0, 10).map(result => result.item)
    // console.log('tenResults', JSON.parse(JSON.stringify(tenResults)));
    searchResults.value = tenResults
    computeHighlightedDates()
  }, { debounce: 650 })

  return {
    searchValue,
    searchResults,
    indexDataset,
    highlightedDates,
    computeHighlightedDates,
  }
})
