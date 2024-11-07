import { onMounted, ref, watch } from 'vue'

export function useTheme() {
  const theme = ref('light') // Set default theme ke 'light'

  function setThemeCookie(value) {
    // Jika di localhost, jangan tambahkan atribut `SameSite=None` dan `Secure`
    if (location.hostname === 'localhost') {
      document.cookie = `arsip-theme=${value}; path=/;`
    } else {
      // Atribut `SameSite=None` dan `Secure` hanya untuk produksi (HTTPS)
      document.cookie = `arsip-theme=${value}; SameSite=None; Secure; path=/;`
    }
  }

  // Set tema default dan simpan di cookie
  onMounted(() => {
    theme.value = 'light'
    setThemeCookie(theme.value)
  })

  function setTheme(newTheme) {
    theme.value = newTheme
    setThemeCookie(newTheme)
  }

  watch(theme, (newTheme) => {
    setThemeCookie(newTheme)
  })

  return { theme, setTheme }
}
