<template>
  <div class="text-center bg-light reg">
    <form class="form-signin" @submit.prevent="register">
      <h1 class="h3 mb-2 font-weight-normal">Register</h1>
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
      <p class="text-danger" v-if="login.length && errors.has('login')">{{ errors.first("login") }}</p>
      <label for="inputName" class="sr-only">Fullname</label>
      <input
        v-model.trim="fullname"
        v-validate="{ required: true, max: 32, min: 1, regex: /^[а-яА-ЯёЁa-zA-Z\s]+$/ }"
        :class="nameClass"
        type="text"
        name="fullname"
        class="form-control mt-2 mb-2"
        placeholder="Your fullname"
        title="You should use just letters, numbers and underscores.
                    From 1 to 32 characters"
      >
      <p class="text-danger mb-2" v-if="fullname.length">{{ errors.first("fullname") }}</p>
      <label for="inputPassword" class="sr-only">Password</label>
      <input
        v-model.trim="password"
        v-validate="{ required: true, min: 6, regex: /^\S+$/ }"
        :class="passwordClass"
        type="password"
        name="password"
        ref="password"
        class="form-control mt-2 mb-2"
        placeholder="Your password"
        title="At least 6 characters"
      >
      <p class="text-danger mb-2" v-if="password.length">{{ errors.first("password") }}</p>
      <label for="pass" class="sr-only">Repeat Password</label>
      <input
        v-model.trim="password_2"
        v-validate="{ required: true, confirmed:password, min: 6, regex: /^\S+$/ }"
        :class="passwordClass_2"
        type="password"
        name="password_2"
        data-vv-as="password"
        class="form-control mt-2 mb-2"
        placeholder="Your password again"
      >
      <p class="text-danger mb-2" v-if="password_2.length">{{ errors.first("password_2") }}</p>
      <p v-if="error.length" class="mt-2 mb-3 text-danger">{{error}}</p>

      <button class="btn btn-success btn-block" :disabled="buttonActive">
        <div v-if="isLoading" class="lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div v-else>Register</div>
      </button>
      <p class="mt-4 mb-2 text-muted">Already have an account?
        <router-link to="/login">Try to login</router-link>
      </p>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      password: "",
      password_2: "",
      login: "",
      fullname: "",
      isLoading: false,
      error: ""
    };
  },
  watch: {
    async login(value) {
      if (
        (!this.errors.has("login") && value.length >= 5) ||
        value.length >= 5
      ) {
        try {
          const isExist = await this.$store.dispatch("isUsernameExist", value);
          if (isExist) {
            const field = this.$validator.fields.find({ name: "login" });
            field.setFlags({ invalid: true });
            this.errors.add({
              field: "login",
              msg: "Sorry, but this username already exists",
              id: field.id,
              scope: field.scope
            });
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  },
  computed: {
    buttonActive() {
      return (
        this.errors.any() ||
        !this.login.length ||
        !this.password.length ||
        !this.password_2.length ||
        !this.fullname.length
      );
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
    },
    passwordClass_2() {
      if (this.errors.has("password_2") && this.password_2.length !== 0)
        return { invalid: true };
      else if (!this.errors.has("password_2") && this.password_2.length !== 0)
        return { valid: true };
    },
    nameClass() {
      if (this.errors.has("fullname") && this.fullname.length !== 0)
        return { invalid: true };
      else if (!this.errors.has("fullname") && this.fullname.length !== 0)
        return { valid: true };
    }
  },
  methods: {
    async register() {
      const username = this.login;
      const fullname = this.fullname;
      const password = this.password;
      const password_2 = this.password_2;
      try {
        this.isLoading = true;
        const user = await this.$store.dispatch("register", {
          username,
          fullname,
          password,
          password_2
        });
        this.$socket.emit("loggedUser", user._id);
        this.$router.push("/");
      } catch (error) {
        console.log(error);
        this.error = "Error: Incorrect username or password. Try again, please";
        this.username = "";
        this.fullname = "";
        this.password = "";
        this.password_2 = "";
      }
      this.isLoading = false;
    }
  }
};
</script>


<style>
</style>