<template>
  <div></div>
</template>

<script>
import Vue from "vue";
export default {
  created() {
    this.$gAuth
      .signIn()
      .then(googleUser => {
        console.log("USER: ", googleUser);
        const googleProf = googleUser.getBasicProfile();
        console.log(
          googleProf.getId(),
          googleProf.getName(),
          googleProf.getImageUrl(),
          googleProf.getEmail()
        );
        return this.$store.dispatch("googleLogin", {
          user: {
            googleId: googleProf.getId(),
            name: googleProf.getName(),
            avaUrl: googleProf.getImageUrl(),
            email: googleProf.getEmail()
          }
        });
      })
      .then(user => {
        this.$socket.emit("loggedUser", user._id);
        this.$router.push("/");
      })
      .catch(error => {
        console.error(error);
      });
  }
  // beforeDestroy() {
  //   this.$gAuth
  //     .signOut()
  //     .then(() => {
  //       // things to do when sign-out succeeds
  //     })
  //     .catch(error => {
  //       // things to do when sign-out fails
  //     });
  // }
};
</script>

<style>
</style>
