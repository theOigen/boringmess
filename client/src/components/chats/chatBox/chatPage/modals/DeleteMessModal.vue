<template>
  <div class="modal fade" ref="delmod" id="delMessageWindow">
    <div class="modal-dialog">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header">
          <h4 class="modal-title">Delete Message</h4>
          <button type="button" class="close" :disabled="isDeleting" data-dismiss="modal">&times;</button>
        </div>

        <!-- Modal body -->
        <div v-if="!isDeleting" class="modal-body">
          <p>
            Do you really want to
            <b>delete</b> this message from chat history?
          </p>
        </div>
        <div v-else class="modal-body">
          <div class="text-center">
            <div class="lds-r">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
        <!-- Modal footer -->
        <div class="modal-footer">
          <button
            id="modalCloseBtn"
            type="button"
            class="btn btn-primary"
            :disabled="isDeleting"
            data-dismiss="modal"
          >Close</button>
          <button
            id="modalDelBtn"
            type="button"
            class="btn btn-danger"
            :disabled="isDeleting"
            @click.prevent="submitDelete"
          >Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: {},
      isDeleting: false
    };
  },
  create() {},
  mounted() {
    eventBus.$on("msgToDelete", msg => this.handleDelete(msg));
  },
  beforeDestroy() {
    eventBus.$off("msgToDelete", msg => this.handleDelete(msg));
  },
  methods: {
    handleDelete(msg) {
      this.message = msg;
    },
    async submitDelete() {
      this.isDeleting = true;
      try {
        const deletedMsg = await this.$store.dispatch(
          "deleteMessage",
          this.message
        );
        this.isDeleting = false;
        $("#delMessageWindow").modal("hide");
        this.$socket.emit("deleteMessage", deletedMsg);
      } catch (error) {
        console.log(error);
        this.$notify({
          type: "error",
          group: "msgs",
          title: "Error",
          text: `Oopsie, something goes wrong...`
        });
      }
    }
  }
};
</script>

<style>
</style>
