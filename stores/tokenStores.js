import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTokenStore = defineStore('token', () => {
  const tokenData = ref({
    userId: null,
    roles: [],
    selectedRole: {},
    permissions: [],
    selectedUnit: {},
    iat: null,
    exp: null,
  })

  const setTokenData = newToken => {
    tokenData.value = newToken
  }

  return { tokenData, setTokenData }
})
