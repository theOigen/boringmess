<template>
  <div class="text-center bg-light reg">
    <form action="#" @submit.prevent="Login" class="form-signin">
      <h1 class="h3 mb-2 font-weight-normal">Login</h1>

      <label for="inputLogin" class="sr-only">Login</label>
      <input
        v-model.trim="login"
        v-validate="{ required: true, max: 16, min: 5, regex: /^[a-zA-Z0-9_]+$/ }"
        :class="loginClass"
        type="text"
        name="login"
        class="form-control mt-4 mb-2"
        placeholder="Your login"
        title="You should use just letters, numbers and underscores.
                    From 5 to 16 characters"
      >
      <p class="text-danger" v-show="login.length">{{ errors.first("login") }}</p>
      <label for="inputPassword" class="sr-only">Password</label>
      <input
        v-model.trim="password"
        :class="passwordClass"
        type="password"
        name="password"
        class="form-control mt-2 mb-2"
        placeholder="Your password"
        title="At least 6 characters"
        v-validate="{ required: true, min: 6, regex: /^\S+$/ }"
      >
      <p class="text-danger mb-2" v-show="password.length">{{ errors.first("password") }}</p>
      <p v-if="error.length" class="mt-2 mb-3 text-danger">{{error}}</p>

      <button class="btn btn-success btn-block" :disabled="buttonActive">
        <div v-if="isLoading" class="lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div v-else>Login</div>
      </button>
      <p class="mt-4 mb-2 text-muted">New here?
        <router-link to="/register">Create an account</router-link>
      </p>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      password: "",
      login: "",
      error: "",
      isLoading: false
    };
  },
  computed: {
    buttonActive() {
      return this.errors.any() || !this.login.length || !this.password.length;
    },
    loginClass() {
      if (this.errors.has("login") && this.login.length !== 0)
        return { invalid: true };
      else if (!this.errors.has("login") && this.login.length !== 0)
        return { valid: true };
    },
    passwordClass() {
      if (this.errors.has("password") && this.password.length !== 0)
        return { invalid: true };
      else if (!this.errors.has("password") && this.password.length !== 0)
        return { valid: true };
    }
  },
  methods: {
    async Login() {
      const username = this.login;
      const password = this.password;
      this.isLoading = true;
      try {
        const user = await this.$store.dispatch("retrieveToken", {
          username,
          password
        });
        this.$socket.emit("loggedUser", user._id);
        this.$router.push("/");
      } catch (error) {
        this.error = "Error: Incorrect username or password. Try again, please";
      }
      this.password = "";
      this.login = "";
      this.isLoading = false;
    }
  }
};
</script>


<style>
</style>