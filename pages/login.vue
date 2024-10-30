<script setup>
import tree1 from '@images/misc/tree1.png'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/mask-v2-dark.png'
import authV2MaskLight from '@images/pages/mask-v2-light.png'
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

// State untuk form login
const form = ref({
  email: '',
  password: '',
  remember: false,
})

const isPasswordVisible = ref(false)
const errorMessage = ref('')
const router = useRouter()

// Fungsi untuk submit form login dan panggil API
async function login() {
  errorMessage.value = '' // Reset pesan error

  try {
    // Memanggil API menggunakan fetch
    const response = await fetch('https://x5phivbwydc28xcqc.apps.undip.ac.id/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation SignIn($email: String!, $password: String!) {
            signIn(email: $email, password: $password) {
              token
              expiresAt
            }
          }
        `,
        variables: {
          email: form.value.email,
          password: form.value.password,
        },
      }),
    })

    // Memeriksa respons dari server
    if (!response.ok) {
      throw new Error('Login failed, please check your credentials')
    }

    // Mendapatkan data token dari respons
    const result = await response.json()

    // Cek jika GraphQL mengembalikan error
    if (result.errors) {
      throw new Error(result.errors[0].message)
    }

    const data = result.data.signIn

    localStorage.setItem('authToken', data.token)
    localStorage.setItem('tokenExpiration', data.expiresAt * 1000) // Menyimpan waktu kadaluarsa token

    // Arahkan pengguna ke halaman dashboard jika login berhasil
    router.push('/')
  } catch (error) {
    errorMessage.value = error.message
  }
}
</script>

<template>
  <div>
    <a href="javascript:void(0)">
      <div class="auth-logo d-flex align-center gap-x-3">
        <h1 class="auth-title">ARSIP</h1>
      </div>
    </a>

    <VRow
      no-gutters
      class="auth-wrapper"
    >
      <VCol
        md="8"
        class="d-none d-md-flex position-relative"
      >
        <div
          class="d-flex align-center justify-end w-100 h-100 pa-10"
          :class="$vuetify.locale.isRtl ? 'pe-10' : 'pe-0'"
        >
          <VImg
            max-width="797"
            :src="authThemeImg"
            class="auth-illustration"
          />
        </div>
        <img
          class="auth-footer-mask"
          height="360"
          :src="authThemeMask"
        >
        <VImg
          :src="tree1"
          alt="tree image"
          height="190"
          width="90"
          class="auth-footer-tree"
        />
      </VCol>

      <VCol
        cols="12"
        md="4"
        class="auth-card-v2 d-flex align-center justify-center"
        style="background-color: rgb(var(--v-theme-surface));"
      >
        <VCard
          flat
          :max-width="500"
          class="mt-12 mt-sm-0 pa-4"
        >
          <VCardText>
            <h4 class="text-h4 mb-1">
              Welcome to <span class="text-capitalize">ARSIP!</span> 👋🏻
            </h4>
            <p class="mb-0">
              Please sign-in to your account
            </p>
          </VCardText>
          <VCardText>
            <VForm @submit.prevent="login">
              <VRow>
                <!-- email -->
                <VCol cols="12">
                  <VTextField
                    v-model="form.email"
                    autofocus
                    label="Email"
                    type="email"
                    placeholder="johndoe@email.com"
                  />
                </VCol>

                <!-- password -->
                <VCol cols="12">
                  <VTextField
                    v-model="form.password"
                    label="Password"
                    placeholder="············"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  />
                  <div class="d-flex align-center flex-wrap justify-space-between my-5 gap-2">
                    <VCheckbox
                      v-model="form.remember"
                      label="Remember me"
                    />
                    <a
                      class="text-primary"
                      href="javascript:void(0)"
                    >Forgot Password?</a>
                  </div>
                  <VBtn
                    block
                    type="submit"
                  >
                    Login
                  </VBtn>

                  <!-- Tampilkan pesan error jika ada -->
                  <div
                    v-if="errorMessage"
                    class="text-danger mt-3"
                  >
                    {{ errorMessage }}
                  </div>
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
