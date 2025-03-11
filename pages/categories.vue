<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">
      Categories Management
    </h1>

    <!-- Categories List with Drag and Drop -->
    <UCard class="mb-8">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">
            Categories
          </h2>
          <UButton
            color="primary"
            icon="i-heroicons-plus"
            @click="showAddModal = true"
          >
            Add Category
          </UButton>
        </div>
      </template>

      <div
        v-if="eventCategories.length"
        ref="categoriesContainer"
        class="divide-y"
      >
        <div
          v-for="(category, index) in eventCategories"
          :key="category.title"
          :data-id="index"
          class="py-3 px-2 flex items-center justify-between bg-white"
        >
          <div class="flex items-center gap-3">
            <UIcon
              name="i-heroicons-bars-3"
              class="handle cursor-move text-gray-400 hover:text-gray-600"
            />
            <div
              class="w-5 h-5 rounded-full"
              :style="{ backgroundColor: category.color }"
            />
            <span class="font-medium">{{ category.title }}</span>
            <UBadge
              v-if="category.title === 'default'"
              color="gray"
            >
              Default
            </UBadge>
            <UBadge>Priority: {{ eventCategories.length - index }}</UBadge>
          </div>

          <div class="flex gap-2">
            <UButton
              icon="i-heroicons-pencil-square"
              color="gray"
              variant="ghost"
              @click="editCategory(index)"
            />
            <UButton
              icon="i-heroicons-trash"
              color="red"
              variant="ghost"
              :disabled="category.title === 'default'"
              @click="confirmDelete(index)"
            />
          </div>
        </div>
      </div>
      <div
        v-else
        class="p-4 text-center text-gray-500"
      >
        No categories found
      </div>
    </UCard>

    <!-- Add/Edit Category Modal -->
    <UModal v-model="showModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">
              {{ isEditing ? 'Edit Category' : 'Add Category' }}
            </h3>
            <UButton
              icon="i-heroicons-x-mark"
              color="gray"
              variant="ghost"
              @click="showModal = false"
            />
          </div>
        </template>

        <form
          class="space-y-4"
          @submit.prevent="saveCategory"
        >
          <UFormGroup
            label="Title"
            required
          >
            <UInput
              v-model="formData.title"
              placeholder="Enter category title"
              :disabled="formData.title === 'default'"
            />
          </UFormGroup>

          <UFormGroup
            label="Color"
            required
          >
            <UInput
              v-model="formData.color"
              type="color"
            />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton
              type="button"
              color="gray"
              @click="showModal = false"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              color="primary"
            >
              Save
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">
              Confirm Delete
            </h3>
            <UButton
              icon="i-heroicons-x-mark"
              color="gray"
              variant="ghost"
              @click="showDeleteModal = false"
            />
          </div>
        </template>

        <p class="mb-4">
          Are you sure you want to delete this category? This action cannot be undone.
        </p>

        <div class="flex justify-end gap-2">
          <UButton
            color="gray"
            @click="showDeleteModal = false"
          >
            Cancel
          </UButton>
          <UButton
            color="red"
            @click="deleteSelectedCategory"
          >
            Delete
          </UButton>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useSortable } from '@vueuse/integrations/useSortable'
import { useTemplateRef } from 'vue'
import { useAppStore, type EventCategory } from '~/stores/appStore'

const store = useAppStore()
const { eventCategories } = storeToRefs(store)

// Form state
const showModal = ref(false)
const showAddModal = ref(false)
const isEditing = ref(false)
const editIndex = ref(-1)
const formData = reactive({
  title: '',
  color: '#3b82f6',
})

watch(showAddModal, (val) => {
  if (val) {
    showModal.value = true
    isEditing.value = false
    resetForm()
  }
})

// Delete confirmation
const showDeleteModal = ref(false)
const deleteIndex = ref(-1)

const resetForm = () => {
  formData.title = ''
  formData.color = '#3b82f6'
}

const editCategory = (index: number) => {
  isEditing.value = true
  editIndex.value = index
  const category = store.eventCategories[index]
  formData.title = category.title
  formData.color = category.color
  showModal.value = true
}

const saveCategory = () => {
  if (!formData.title.trim()) return

  const categoryData: EventCategory = {
    title: formData.title.toLowerCase().trim(),
    color: formData.color,
  }

  if (isEditing.value) {
    store.updateCategory(editIndex.value, categoryData)
  }
  else {
    // Add to the end of the array (highest priority)
    store.addCategory(categoryData)
  }

  showModal.value = false
  resetForm()
}

const confirmDelete = (index: number) => {
  deleteIndex.value = index
  showDeleteModal.value = true
}

const deleteSelectedCategory = () => {
  if (deleteIndex.value >= 0) {
    store.deleteCategory(deleteIndex.value)
    showDeleteModal.value = false
  }
}

// Set up drag and drop
const categoriesContainer = useTemplateRef<HTMLElement>('categoriesContainer')

useSortable(categoriesContainer, eventCategories, {
  handle: '.handle',
  animation: 150,
})
</script>
