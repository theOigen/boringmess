<template>
  <div class="modal fade" ref="delChat" id="delChatWindow">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Delete Chat</h4>
          <button type="button" class="close" :disabled="isDeleting" data-dismiss="modal">&times;</button>
        </div>

        <div v-if="!isDeleting" class="modal-body">
          <p>
            Do you really want to
            <b>delete</b> this chat?
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

        <div class="modal-footer">
          <button
            id="chatModalCloseBtn"
            type="button"
            class="btn btn-primary"
            :disabled="isDeleting"
            data-dismiss="modal"
          >Close</button>
          <button
            id="chatModalDelBtn"
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
      chat: {},
      isDeleting: false
    };
  },
  mounted() {
    eventBus.$on("chatToDelete", chat => this.handleDelete(chat));
  },
  beforeDestroy() {
    eventBus.$off("chatToDelete", chat => this.handleDelete(chat));
  },
  methods: {
    handleDelete(chat) {
      this.chat = chat;
    },
    async submitDelete() {
      this.isDeleting = true;
      try {
        const resp = await this.$store.dispatch("deleteChat", this.chat);
        $("#delChatWindow").modal("hide");
        this.$socket.emit("deleteChat", resp.deletedChat._id);
        this.isDeleting = false;
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
.lds-r {
  display: inline-block;
  position: relative;
  width: 35px;
  height: 35px;
}
.lds-r div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 35px;
  height: 35px;
  border: 3px solid rgb(32, 146, 223);
  border-radius: 50%;
  animation: lds-r 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: rgb(32, 146, 223) transparent transparent transparent;
}
.lds-r div:nth-child(1) {
  animation-delay: -0.45s;
}
.lds-r div:nth-child(2) {
  animation-delay: -0.3s;
}
.lds-r div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes lds-r {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>