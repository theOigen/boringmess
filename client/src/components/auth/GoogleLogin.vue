<template>
  <div></div>
</template>

<script>
import Vue from "vue";
export default {
  created() {
    this.$gAuth
      .getAuthCode()
      .then(authCode => {
        return this.$store.dispatch("googleLogin", {
          code: authCode,
          redirect_uri: "postmessage"
        });
      })
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.error(error);
      });
  }
};
</script>

<style>
</style>
