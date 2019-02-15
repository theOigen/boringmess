<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
      <div class="container">
        <div class="navbar-header">
          <router-link class="navbar-brand" to="/">Boring Messenger</router-link>
        </div>
        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="navbar-collapse collapse" id="navbarNavAltMarkup">
          <div class="navbar-nav ml-auto">
            <router-link class="nav-item nav-link" to="/">Home</router-link>
            <router-link
              class="nav-item nav-link"
              :to="{ name: 'profile', params: { id: $store.state.user._id, usr: $store.state.user } }"
              v-if="$store.getters.isLoggedIn"
            >Profile</router-link>
            <router-link
              class="nav-item nav-link"
              to="/users"
              v-if="$store.getters.isLoggedIn"
            >Users</router-link>
            <router-link
              class="nav-item nav-link"
              to="/chats"
              v-if="$store.getters.isLoggedIn"
            >Chats</router-link>
            <router-link class="nav-item nav-link" to="/about">About</router-link>
            <router-link class="nav-item nav-link" to="/developer/v2">API</router-link>
            <router-link
              class="nav-item nav-link"
              to="/login"
              v-if="!$store.getters.isLoggedIn"
            >Login</router-link>
            <router-link
              class="nav-item nav-link"
              to="/register"
              v-if="!$store.getters.isLoggedIn"
            >Register</router-link>
            <router-link
              class="nav-item nav-link"
              to="/logout"
              v-if="$store.getters.isLoggedIn"
            >Logout</router-link>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  name: "navigation",
  data() {
    return {};
  },
  created() {},
  methods: {}
};
</script>

<style lang="css">
.navbar {
  border-bottom: 2px solid #e8e8e8;
  font-size: 14pt;
  padding: 0;
}

.navbar .container {
  padding: 0;
}

.navbar-light .navbar-nav .router-link-exact-active {
  padding-bottom: 12px;
  box-shadow: 0px 2px 0px 0px #161616;
  color: #161616;
  /* color: rgba(0, 0, 0, 0.9); */
}

.navbar-light .navbar-nav .nav-link {
  transition: padding-bottom 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  padding-bottom: 12px;
}

.navbar-light .navbar-nav .nav-link:hover {
  box-shadow: 0px 2px 0px 0px #161616;
  color: rgba(0, 0, 0, 0.9);
}
</style>
