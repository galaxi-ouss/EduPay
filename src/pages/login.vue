<script setup lang="ts">
import { useAuthStore } from "@/store/useAuthStore";
import { useStudentStore } from "@/store/useStudentStore";
import { useGenerateImageVariant } from "@core/composable/useGenerateImageVariant";
import authV2LoginIllustrationBorderedDark from "@images/pages/auth-v2-login-illustration-bordered-dark.png";
import authV2LoginIllustrationBorderedLight from "@images/pages/auth-v2-login-illustration-bordered-light.png";
import authV2LoginIllustrationDark from "@images/pages/auth-v2-login-illustration-dark.png";
import authV2LoginIllustrationLight from "@images/pages/auth-v2-login-illustration-light.png";
import authV2MaskDark from "@images/pages/misc-mask-dark.png";
import authV2MaskLight from "@images/pages/misc-mask-light.png";
import { VNodeRenderer } from "@layouts/components/VNodeRenderer";
import { themeConfig } from "@themeConfig";
import { jwtDecode } from 'jwt-decode';
import { toast } from 'vue3-toastify';
import { VForm } from "vuetify/components/VForm";

definePage({
  meta: {
    layout: "blank",
    unauthenticatedOnly: true,
  }

});
const credentials = ref({
  email: "hamza@damiri.com",
  password: "123321",
});

const isPasswordVisible = ref(false);

const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark,
  true
);

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark);

//******************************************************************************************* */

const route = useRoute();
const router = useRouter();

const ability = useAbility();

const errors = ref<Record<string, string | undefined>>({
  email: undefined,
  password: undefined,
});
//  const notify = () => {
//       Vue3Toastify("Wow so easy !", {
//         autoClose: 1000,
//       }); // ToastOptions
//     }
const refVForm = ref<VForm>();
const authStore = useAuthStore();
const { login, getCurrentUser, setCurrentUser, setToken } = authStore;
const { loading, error } = storeToRefs(authStore);
const studentStore = useStudentStore()
const { setCurrentStudentEmail } = (studentStore)
const { currentEmail } = storeToRefs(studentStore)
const loader = ref(false)

const LogIn = async () => {
  try {
    loader.value = true
    const data = await login(credentials.value);
    const token = data.access_token
    setToken(token);

    // Redirect
    if (token) {
      const isLoggedIn = !!(useCookie('accessToken').value)
      if (isLoggedIn) {
        // setTimeout(() => {
        //   loader.value = false
        // }, 1000)

        const userData = jwtDecode(token?.toString()) || {}
        if (!userData?.isPasswordChanged) {
          router.push(route.query.to ? String(route.query.to) : "/force-change-password");
        }
        else {
          const userDataa = await getCurrentUser();
          setCurrentUser(userDataa);
          let userAbilityRules = [];
          if (userData?.scope.includes("ROLE_ADMIN")) {
            userAbilityRules = [
              { action: "manage", subject: "all" },
              { action: "manage", subject: "ADMIN" },
              { action: "manage", subject: "STUDENT" },
            ];
          } else {
            userAbilityRules = [{ action: "manage", subject: "STUDENT" }];
          }

          useCookie("userAbilityRules").value = userAbilityRules;
          ability.update(userAbilityRules);

          router.push(route.query.to ? String(route.query.to) : "/").finally(() => {
            loader.value = false
            toast.success('Login successful ✔', {
              "theme": useCookie('EduPayment-theme').value || 'auto'
            })
          })
        }
      }
      else {
        toast.error(error.value + ' 🧨❌', {
          "theme": useCookie('EduPayment-theme').value || 'auto'
        })
        loader.value = false
      }
    }
    else {
      toast.error(error.value + ' 🧨❌', {
        "theme": useCookie('EduPayment-theme').value || 'auto'
      })
      loader.value = false

    }
  } catch (err) {
    console.error(err);
  }
};

const onLoginSubmit = () => {
  refVForm.value
    ?.validate()
    .then(({ valid }) => {
      if (valid) {
        LogIn();
      }
    })
    .catch((err) => console.log(err));
};



// toast.success('Login successful!', {
//               "theme": useCookie('EduPayment-theme').value || 'auto'
//             })
</script>

<template>
  <a href="javascript:void(0)">
    <div class="auth-logo d-flex align-center gap-x-3">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="auth-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </a>

  <VRow no-gutters class="auth-wrapper bg-surface">
    <VCol md="8" class="d-none d-md-flex">
      <div class="position-relative bg-background w-100 me-0">
        <div class="d-flex align-center justify-center w-100 h-100" style="padding-inline: 6.25rem">
          <VImg max-width="613" :src="authThemeImg" class="auth-illustration mt-16 mb-2" />
        </div>

        <img class="auth-footer-mask flip-in-rtl" :src="authThemeMask" alt="auth-footer-mask" height="280" width="100" />
      </div>
    </VCol>

    <VCol cols="12" md="4" class="auth-card-v2 d-flex align-center justify-center">
      <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-6">
        <VCardText>
          <h4 class="text-h4 mb-1">
            Welcome to
            <span class="text-capitalize">{{ themeConfig.app.title }}</span>! 👋🏻
          </h4>
          <p class="mb-0">
            Please sign-in to your account and start the adventure
          </p>
        </VCardText>
        <VCardText>
          <VForm ref="refVForm" @submit.prevent="LogIn">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField v-model="credentials.email" autofocus label="Email or Username" type="email" placeholder="Email address or username" :rules="[requiredValidator, emailValidator]" />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField v-model="credentials.password" label="Password" placeholder="Password" :error-messages="errors.password" :type="isPasswordVisible ? 'text' : 'password'" :append-inner-icon="
                    isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  " @click:append-inner="isPasswordVisible = !isPasswordVisible" :rules="[requiredValidator]" />
                <div class="d-flex align-center flex-wrap justify-space-between mt-3">
                  <RouterLink class="text-secondary ms-2 mb-1" :to="{ name: 'forgot-password' }">
                    Forgot Password?
                  </RouterLink>
                </div>
                <VBtn class="mt-5" block type="submit" :loading="loader">
                  Login
                </VBtn>
              </VCol>

              <!-- create account -->
              <VCol cols="12" class="text-body-1 text-center">
                <VDivider class="mb-5" />
                <span class="d-block">New on our platform?</span>

                <RouterLink class="text-secondary" :to="{ name: 'register' }">
                  Create an account
                </RouterLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
@use "@core/scss/template/pages/page-auth.scss";
::v-deep(.text-secondary:hover) {
  color: red !important;
}
</style>
