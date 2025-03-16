<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">
      Periods Management
    </h1>

    <!-- Period Templates List -->
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">
          Period Templates
        </h2>
        <button
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          @click="openNewTemplateForm"
        >
          Add New Period
        </button>
      </div>

      <!-- List of period templates -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Age Range
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period Type
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="template in eventsStore.periodTemplates"
              :key="template.id"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">
                  {{ template.title }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ template.description }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :style="{ backgroundColor: eventsStore.categoryColorMap[template.category] }"
                >
                  {{ template.category }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ template.ageStart }} {{ template.ageEnd ? `- ${template.ageEnd}` : '' }} years
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ template.generateYearly ? 'Yearly Events' : 'Single Period' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  class="text-indigo-600 hover:text-indigo-900 mr-2"
                  @click="editTemplate(template)"
                >
                  Edit
                </button>
                <button
                  class="text-red-600 hover:text-red-900"
                  @click="confirmDelete(template.id)"
                >
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="eventsStore.periodTemplates.length === 0">
              <td
                colspan="5"
                class="px-6 py-4 text-center text-gray-500"
              >
                No period templates found. Add one to get started.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Template Form Modal -->
    <div
      v-if="showForm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h3 class="text-xl font-semibold mb-4">
          {{ isEditing ? 'Edit' : 'Add' }} Period Template
        </h3>
        <form @submit.prevent="saveTemplate">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <!-- Basic Info -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Title</label>
                <input
                  v-model="formData.title"
                  type="text"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  v-model="formData.description"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Category</label>
                <select
                  v-model="formData.category"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option
                    v-for="category in eventsStore.eventCategories"
                    :key="category.title"
                    :value="category.title"
                  >
                    {{ category.title }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Age and Date Info -->
            <div class="space-y-4">
              <div class="flex space-x-4">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700">Age Start</label>
                  <input
                    v-model.number="formData.ageStart"
                    type="number"
                    min="0"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                </div>
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700">Age End (optional)</label>
                  <input
                    v-model.number="formData.ageEnd"
                    type="number"
                    min="0"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                </div>
              </div>

              <div class="flex space-x-4">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700">Start Month</label>
                  <select
                    v-model="formData.dateStart.month"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="0">
                      January
                    </option>
                    <option value="1">
                      February
                    </option>
                    <option value="2">
                      March
                    </option>
                    <option value="3">
                      April
                    </option>
                    <option value="4">
                      May
                    </option>
                    <option value="5">
                      June
                    </option>
                    <option value="6">
                      July
                    </option>
                    <option value="7">
                      August
                    </option>
                    <option value="8">
                      September
                    </option>
                    <option value="9">
                      October
                    </option>
                    <option value="10">
                      November
                    </option>
                    <option value="11">
                      December
                    </option>
                  </select>
                </div>
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700">Start Day</label>
                  <input
                    v-model.number="formData.dateStart.day"
                    type="number"
                    min="1"
                    max="31"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                </div>
              </div>

              <div class="flex space-x-4">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700">End Month (optional)</label>
                  <select
                    v-model="formData.dateEnd.month"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option :value="null">
                      Same as start
                    </option>
                    <option value="0">
                      January
                    </option>
                    <option value="1">
                      February
                    </option>
                    <option value="2">
                      March
                    </option>
                    <option value="3">
                      April
                    </option>
                    <option value="4">
                      May
                    </option>
                    <option value="5">
                      June
                    </option>
                    <option value="6">
                      July
                    </option>
                    <option value="7">
                      August
                    </option>
                    <option value="8">
                      September
                    </option>
                    <option value="9">
                      October
                    </option>
                    <option value="10">
                      November
                    </option>
                    <option value="11">
                      December
                    </option>
                  </select>
                </div>
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700">End Day (optional)</label>
                  <input
                    v-model.number="formData.dateEnd.day"
                    type="number"
                    min="1"
                    max="31"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                </div>
              </div>

              <div>
                <div class="flex items-center">
                  <input
                    v-model="formData.generateYearly"
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  >
                  <label class="ml-2 block text-sm text-gray-700">Generate yearly events</label>
                </div>
              </div>

              <div v-if="formData.generateYearly">
                <label class="block text-sm font-medium text-gray-700">Yearly Title Format</label>
                <input
                  v-model="formData.yearlyTitleFormat"
                  type="text"
                  placeholder="${yearNumber}º Grade"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                <p class="mt-1 text-xs text-gray-500">
                  Use ${yearNumber} to include the year count in the title
                </p>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="showForm = false"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4">
          Confirm Delete
        </h3>
        <p class="mb-6">
          Are you sure you want to delete this period template? This action cannot be undone.
        </p>
        <div class="flex justify-end space-x-3">
          <button
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="showDeleteConfirm = false"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            @click="deleteTemplate"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useEventsStore } from '~/stores/events'

const eventsStore = useEventsStore()
const showForm = ref(false)
const isEditing = ref(false)
const currentTemplateId = ref('')
const showDeleteConfirm = ref(false)
const templateToDeleteId = ref('')

const defaultFormData = {
  title: '',
  description: '',
  category: 'default',
  ageStart: 0,
  ageEnd: null as number | null,
  dateStart: { month: 0, day: 1 },
  dateEnd: { month: null as number | null, day: null as number | null },
  generateYearly: false,
  yearlyTitleFormat: '',
  yearlyDescriptionFormat: '',
}

const formData = reactive({ ...defaultFormData })

const openNewTemplateForm = () => {
  // Reset form
  Object.assign(formData, defaultFormData)
  isEditing.value = false
  currentTemplateId.value = ''
  showForm.value = true
}

const editTemplate = (template: any) => {
  // Copy template data to form
  Object.assign(formData, {
    ...template,
    dateEnd: template.dateEnd || { month: null, day: null },
  })

  isEditing.value = true
  currentTemplateId.value = template.id
  showForm.value = true
}

const saveTemplate = () => {
  // Create a clean template object
  const templateToSave = {
    id: currentTemplateId.value || `template-${Date.now()}`,
    title: formData.title,
    description: formData.description,
    category: formData.category,
    ageStart: formData.ageStart,
    ageEnd: formData.ageEnd || undefined,
    dateStart: {
      month: formData.dateStart.month,
      day: formData.dateStart.day,
    },
    dateEnd: (formData.dateEnd.month !== null && formData.dateEnd.day !== null)
      ? {
          month: formData.dateEnd.month,
          day: formData.dateEnd.day,
        }
      : undefined,
    generateYearly: formData.generateYearly || undefined,
    yearlyTitleFormat: formData.yearlyTitleFormat || undefined,
    yearlyDescriptionFormat: formData.yearlyDescriptionFormat || undefined,
  }

  if (isEditing.value) {
    eventsStore.updatePeriodTemplate(currentTemplateId.value, templateToSave)
  }
  else {
    eventsStore.addPeriodTemplate(templateToSave)
  }

  showForm.value = false
}

const confirmDelete = (id: string) => {
  templateToDeleteId.value = id
  showDeleteConfirm.value = true
}

const deleteTemplate = () => {
  eventsStore.deletePeriodTemplate(templateToDeleteId.value)
  showDeleteConfirm.value = false
}
</script>
