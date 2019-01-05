<template></template>

<script>
export default {
  created() {
    this.$store
      .dispatch("destroyToken")
      .then(response => this.$router.push("/"));
  }
};
</script>

<style>
</style>
