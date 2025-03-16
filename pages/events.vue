<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">
      Custom Events
    </h1>

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
import { ref } from 'vue'
import { useAppStore, type EventObject } from '~/stores/appStore'

const store = useAppStore()

// Add state variables for editing mode
const isEditing = ref(false)
const editingIndex = ref(-1)

const newEvent = ref<EventObject>({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  category: 'default',
  type: 'custom',
})

const addEvent = () => {
  // Validation
  if (!newEvent.value.title || !newEvent.value.startDate) {
    alert('Title and Start Date are required')
    return
  }

  if (isEditing.value) {
    // Update existing event
    store.updateCustomEvent(editingIndex.value, { ...newEvent.value })
    isEditing.value = false
    editingIndex.value = -1
  } else {
    // Add new event
    store.addCustomEvent({ ...newEvent.value })
  }

  // Reset the form
  resetForm()
}

const resetForm = () => {
  newEvent.value = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    category: 'default',
    type: 'custom',
  }
}

const editEvent = (index: number) => {
  // Set editing state and populate form with event data
  isEditing.value = true
  editingIndex.value = index
  newEvent.value = { ...store.customEvents[index] }
  
  // Scroll to the form
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

  if (!endDate) return store.dayjs(startDate).format('MMMM D, YYYY')

  return `${store.dayjs(startDate).format('MMMM D, YYYY')} - ${store.dayjs(endDate).format('MMMM D, YYYY')}`
}
</script>
