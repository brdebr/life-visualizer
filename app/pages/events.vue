<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">
      Custom Events
    </h1>

    <!-- Import events section -->
    <div class="bg-gray-100 p-4 rounded-lg mb-4">
      <h2 class="text-lg font-semibold mb-4">
        Import Events from Endpoint
      </h2>
      <div class="flex gap-4">
        <input
          v-model="importEndpoint"
          placeholder="Enter API endpoint URL"
          class="flex-1 px-3 py-2 border rounded-md"
        >
        <button
          class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          :disabled="isLoading"
          @click="loadEventsFromEndpoint"
        >
          {{ isLoading ? 'Loading...' : 'Load Events' }}
        </button>
      </div>
      <p
        v-if="importMessage"
        class="mt-2 text-sm"
        :class="importError ? 'text-red-500' : 'text-green-500'"
      >
        {{ importMessage }}
      </p>
    </div>

    <!-- Add new event form -->
    <div class="bg-gray-100 p-4 rounded-lg mb-8">
      <h2 class="text-lg font-semibold mb-4">
        {{ isEditing ? 'Edit Event' : 'Add New Event' }}
      </h2>
      <form
        class="space-y-4"
        @submit.prevent="addEvent"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Event Title</label>
            <input
              v-model="newEvent.title"
              class="w-full px-3 py-2 border rounded-md"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Category</label>
            <select
              v-model="newEvent.category"
              class="w-full px-3 py-2 border rounded-md"
            >
              <option
                v-for="category in store.eventCategories"
                :key="category.title"
                :value="category.title"
              >
                {{ category.title }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Start Date</label>
            <input
              v-model="newEvent.startDate"
              type="date"
              class="w-full px-3 py-2 border rounded-md"
              required
            >
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">End Date (optional)</label>
            <input
              v-model="newEvent.endDate"
              type="date"
              class="w-full px-3 py-2 border rounded-md"
            >
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Description</label>
          <textarea
            v-model="newEvent.description"
            class="w-full px-3 py-2 border rounded-md h-24"
          />
        </div>

        <div class="flex">
          <button
            type="submit"
            class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            {{ isEditing ? 'Update Event' : 'Add Event' }}
          </button>
          <button
            v-if="isEditing"
            type="button"
            class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 ml-2"
            @click="cancelEdit"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Display existing events -->
    <div>
      <h2 class="text-xl font-semibold mb-4">
        Your Custom Events
      </h2>

      <div
        v-if="store.customEvents.length === 0"
        class="text-gray-500"
      >
        No custom events added yet.
      </div>

      <div
        v-else
        class="space-y-4"
      >
        <div
          v-for="(event, index) in store.customEvents"
          :key="index"
          class="border rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
          :class="{ 'border-l-4': event.category }"
          :style="{ borderLeftColor: getCategoryColor(event.category) }"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium text-lg">
                {{ event.title }}
              </h3>
              <div class="text-sm text-gray-600 mt-1">
                {{ formatDateRange(event.startDate, event.endDate) }}
              </div>
              <div class="mt-2 text-gray-700">
                {{ event.description }}
              </div>
              <div class="mt-2">
                <span
                  class="inline-block px-2 py-1 text-xs rounded-full"
                  :style="{ backgroundColor: getCategoryColor(event.category), color: 'white' }"
                >
                  {{ event.category }}
                </span>
              </div>
            </div>
            <div class="flex space-x-2">
              <button
                class="text-blue-500 hover:text-blue-700"
                @click="editEvent(index)"
              >
                Edit
              </button>
              <button
                class="text-red-500 hover:text-red-700"
                @click="deleteEvent(index)"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImportEventPayload } from '~/stores/appStore'

const dayjs = useDayjs()
const store = useEventsStore()

const isEditing = ref(false)
const editingIndex = ref(-1)

// Import events data
const importEndpoint = ref('')
const isLoading = ref(false)
const importMessage = ref('')
const importError = ref(false)

// Load events from the provided endpoint
const loadEventsFromEndpoint = async () => {
  if (!importEndpoint.value) {
    importError.value = true
    importMessage.value = 'Please enter an endpoint URL'
    return
  }

  try {
    isLoading.value = true
    importMessage.value = ''
    importError.value = false

    const response = await fetch(importEndpoint.value)

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`)
    }

    const data = await response.json() as ImportEventPayload

    if ((!data.events || !Array.isArray(data.events))
      && (!data.periods || !Array.isArray(data.periods))) {
      throw new Error('Invalid data format: expected { events: [...] } and/or { periods: [...] }')
    }

    // Add each event to the store
    let importedCount = 0
    let updatedCount = 0

    // Process regular events
    if (data.events && Array.isArray(data.events)) {
      for (const event of data.events) {
        if (event.title && event.startDate) {
          // Check if event with same title already exists
          const existingIndex = store.customEvents.findIndex(e => e.title === event.title)

          if (existingIndex !== -1) {
            // Update existing event
            store.updateCustomEvent(existingIndex, { ...event })
            updatedCount++
          }
          else {
            // Add new event
            store.addCustomEvent({ ...event })
            importedCount++
          }
        }
      }
    }

    // Process periods
    if (data.periods && Array.isArray(data.periods)) {
      for (const period of data.periods) {
        if (period.title && period.id) {
          // Find if a period with the same id already exists
          const existingPeriodIndex = store.periodTemplates.findIndex(p => p.id === period.id)

          if (existingPeriodIndex !== -1) {
            // Update the existing period template
            store.updatePeriodTemplate(period.id, { ...period })
            updatedCount++
          }
          else {
            // Add as a new period template
            store.addPeriodTemplate({ ...period })
            importedCount++
          }
        }
      }
    }

    importError.value = false
    importMessage.value = `Successfully imported ${importedCount} items and updated ${updatedCount} existing items`
    importEndpoint.value = '' // Clear the input
  }
  catch (error) {
    console.error('Error importing events:', error)
    importError.value = true
    importMessage.value = `Error: ${error instanceof Error ? error.message : 'Failed to load events'}`
  }
  finally {
    isLoading.value = false
  }
}

const newEvent = ref<EventObject>({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  category: 'default',
})

const addEvent = () => {
  if (!newEvent.value.title || !newEvent.value.startDate) {
    alert('Title and Start Date are required')
    return
  }

  if (isEditing.value) {
    store.updateCustomEvent(editingIndex.value, { ...newEvent.value })
    isEditing.value = false
    editingIndex.value = -1
  }
  else {
    store.addCustomEvent({ ...newEvent.value })
  }

  resetForm()
}

const resetForm = () => {
  newEvent.value = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    category: 'default',
  }
}

const editEvent = (index: number) => {
  isEditing.value = true
  editingIndex.value = index
  newEvent.value = { ...store.customEvents[index] }

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  isEditing.value = false
  editingIndex.value = -1
  resetForm()
}

const deleteEvent = (index: number) => {
  if (confirm('Are you sure you want to delete this event?')) {
    store.deleteCustomEvent(index)
  }
}

const getCategoryColor = (categoryName?: string) => {
  const category = store.getCategoryByName(categoryName)
  return category.color
}

const formatDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate) return ''

  if (!endDate) return dayjs(startDate).format('MMMM D, YYYY')

  return `${dayjs(startDate).format('MMMM D, YYYY')} - ${dayjs(endDate).format('MMMM D, YYYY')}`
}
</script>
