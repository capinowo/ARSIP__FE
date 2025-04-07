<!-- eslint-disable import/no-unresolved -->
<script setup>
import authV2LoginIllustrationBorderedDark from '@/images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@/images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@/images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@/images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@/images/pages/mask-v2-dark.png'
import authV2MaskLight from '@/images/pages/mask-v2-light.png'
import undipLogo from '@/images/undiplogo2.png'; // Import the logo
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import { setAuthToken } from '@/middleware/auth'

import Snackbar from '@/components/Snackbar.vue'
import { BASE_URL } from "@/utils/api"
import { navigateTo } from 'nuxt/app'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Variabel gambar untuk tema gelap dan terang
const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

// Mengatur layout halaman
definePageMeta({
  layout: 'blank',
  public: true,
})

const snackbarRef = ref(null)

// Define showSnackbar function

// State untuk form login
const form = ref({
  username: '',
  password: '',
  remember: false,
})

const isPasswordVisible = ref(false)
const errorMessage = ref('') // State untuk error message
const router = useRouter()

// Fungsi untuk submit form login dan panggil API
async function login() {
  errorMessage.value = '' // Reset pesan error

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation($username: String!, $password: String!) {
            login(username: $username, password: $password)
          }
        `,
        variables: {
          username: form.value.username,
          password: form.value.password,
        },
      }),
    })

    const data = await response.json()

    if (!response.ok || data.errors) {
      // Ambil error message dari response
      const errorMessages = data.errors
        ? data.errors.map(err => err.message).join(', ')
        : 'Terjadi kesalahan saat login'

      // Menampilkan error di snackbar
      snackbarRef.value.showSnackbar(errorMessages, 'error')
    } else {
      // Jika login berhasil, set token dan navigasi ke halaman selanjutnya
      setAuthToken(data.data.login)
      navigateTo('/role')
    }
  } catch (error) {
    console.error('Fetch error:', error)
    snackbarRef.value.showSnackbar('Network error. Please try again later.', 'error')
  }
}

function showSSOUnavailable() {
  snackbarRef.value.showSnackbar('Maaf, fitur belum tersedia', 'info')
}

</script>

<template>
  <div>
    <a href="javascript:void(0)">
      <div class="auth-logo d-flex align-center gap-x-3">
        <NavbarThemeSwitcher />
      </div>
    </a>

    <VRow no-gutters class="auth-wrapper" align="center" justify="center" style="min-height: 100vh;">


      <VCol cols="12" md="4" class="auth-card-v2 d-flex align-center justify-center"
        style="background-color: rgb(var(--v-theme-surface));">
        <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-4">
          <VCardText>
            <!-- Logo positioned above the welcome text -->
            <img :src="undipLogo" alt="Undip Logo" class="mb-4"
              style=" display: block;inline-size: 100px; margin-block: 0; margin-inline: auto;">
            <div class="welcome-text text-center">
              <!-- Center-aligned text container -->
              <h4 class="text-h4 mb-1">
                Welcome to <span class="text-capitalize">ARSIP</span>
              </h4>
              <p class="mb-0">
                Please sign-in to your account
              </p>
            </div>
          </VCardText>
          <VCardText>
            <VForm @submit.prevent="login">
              <VRow>
                <!-- email -->
                <VCol cols="12">
                  <VTextField v-model="form.username" autofocus label="Username" type="text" placeholder="johndoe"
                    :rules="[v => !!v || 'Username is required']" />
                </VCol>

                <!-- password -->
                <VCol cols="12">
                  <VTextField v-model="form.password" label="Password" placeholder="············"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                    :rules="[v => !!v || 'Password is required']"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible" />
                  <div class="d-flex align-center flex-wrap justify-space-between my-5 gap-2">
                    <VCheckbox v-model="form.remember" label="Remember me" />
                  </div>
                  <VBtn block type="submit">
                    Login
                  </VBtn>
                  <VBtn block variant="outlined" class="mt-4" @click="showSSOUnavailable">
                    <VIcon start icon="mdi-window" /> Login with SSO
                  </VBtn>


                  <!-- Tampilkan pesan error jika ada -->
                  <Snackbar ref="snackbarRef" />
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>


<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
