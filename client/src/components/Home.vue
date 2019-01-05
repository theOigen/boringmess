<template>
  <div>
    <header>
      <div class="container text-center">
        <img alt="BoringChat logo" class="bm-logo" src="../assets/bm.png">
        <p align="center" class="bchat">BoringMessenger
          <br>
          <span id="subtitle">a new era of messaging</span>
        </p>
      </div>
    </header>
    <br>
    <div class="container">
      <p>Hello, this is the main page BoringMessenger. What is BoringMessenger? This is a completely new form of web messenger. In our opinion, the messenger is not only communication between several users. A messenger about something more, it's like a web version of your home. We tried to implement a similar atmosphere in our project. We hope you enjoy the process of using it as much as we liked the process of developing it.</p>
      <p>You are probably wondering "why is there so little text on the main page?" That's because we spent most of our time on the development of functionality, and not on filling the main page. But the “beloved” lorem ipsum is not here either, because we think that this is tasteless. Why distract you with this? Go and use our messenger!</p>
      <p>Well, seriously, you can read more on the
        <router-link to="/about" class="aboutLink">about</router-link>page.
      </p>
      <div class="text-center">
        <router-link
          to="/register"
          class="btn btn-outline-dark"
          v-if="!$store.getters.isLoggedIn"
        >Join the new era!</router-link>
      </div>
      <br>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  created() {},
  mounted() {},
  methods: {}
};
</script>


<style>
.bchat {
  font-family: Roboto, Helvetica;
  font-size: 20pt;
  color: #404649;
  font-weight: lighter;
  margin: 0;
  padding: 0;
}
#subtitle {
  font-size: 15pt;
  color: #53585c;
}
header img {
  position: absolute;
  width: 140px;
  height: 140px;
  margin: auto;
}
.bm-logo {
  display: block;
  top: 0px;
  left: 0px;
  align-content: center;
  position: relative;
  height: 120px;
  width: 120px;
}
.aboutLink {
  color: #0971fa;
}
.aboutLink:hover {
  text-decoration: none;
  color: #404649;
}
</style>