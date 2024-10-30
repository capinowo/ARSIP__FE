// middleware/auth.js
import { jwtDecode } from 'jwt-decode'

export default defineNuxtRouteMiddleware((to, from) => {
  if (!import.meta.env.SSR) { // Memastikan kode berjalan hanya di sisi klien
    // Ambil token dari localStorage
    const token = localStorage.getItem('authToken')
    
    // Jika token tidak ada, arahkan ke halaman login
    if (!token) {
      return navigateTo('/login')
    }

    try {
      // Dekode token untuk mendapatkan waktu kedaluwarsa (exp)
      const decoded = jwtDecode(token)
      const currentTime = Date.now() / 1000

      // Periksa apakah token sudah kadaluarsa
      if (decoded.exp < currentTime) {
        localStorage.removeItem('authToken') // Hapus token yang kadaluarsa
        localStorage.removeItem('tokenExpiration')
        
        return navigateTo('/login') // Arahkan ke halaman login jika token kadaluarsa
      }
    } catch (error) {
      // Jika terjadi error dalam mendekode token, anggap token tidak valid dan redirect ke login
      localStorage.removeItem('authToken')
      localStorage.removeItem('tokenExpiration')
      
      return navigateTo('/login')
    }
  }
})
