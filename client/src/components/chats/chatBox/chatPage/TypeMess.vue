<template>
  <div class="typeMess" :class="{disable: isSending}">
    <div class="messWriteArea">
      <form id="sendMsgForm">
        <textarea
          @keydown="inputHandler"
          v-model="content"
          class="writeMess"
          placeholder="Type a message"
          name="messContent"
          ref="msgContent"
          :disabled="isSending"
          :focus="!isSending"
        ></textarea>
        <div class="row">
          <div class="col-4">
            <input
              v-validate="'size: 10240'"
              ref="file"
              id="file-2"
              type="file"
              name="mess_file"
              data-vv-as="file"
              :disabled="isSending"
              @change="handleFileUpload"
              class="inputfile inputfile-2"
            >
            <label for="file-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" viewBox="0 0 20 17">
                <path
                  d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"
                ></path>
              </svg>
              <span ref="fileSpan">Choose a file&hellip;</span>
            </label>
          </div>
          <div class="col-6">
            <div v-if="isSending" class="slider">
              <div class="lds-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
            <div v-if="error.length" class="err">{{error}}</div>
          </div>
          <div class="col-2">
            <button
              id="sentMsgBtn"
              @click.prevent="sendMsg"
              class="sendMessBtn"
              :disabled="isSending"
            >
              <i class="fa fa-paper-plane-o" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      content: "",
      attachment: "",
      isSending: false,
      error: ""
    };
  },
  mounted() {
    eventBus.$on("chat changed", this.clearArea);
  },
  beforeDestroy() {
    eventBus.$off("chat changed", this.clearArea);
  },
  methods: {
    handleFileUpload() {
      this.error = "";
      this.attachment = this.$refs.file.files[0];
      if (this.attachment) {
        const filesize = (this.attachment.size / 1024 / 1024).toFixed(4); // MB
        if (filesize > 10) {
          this.attachment = "";
          this.error = "Filesize must be lass than 10MB";
        }
      }
      const fileName = this.attachment ? this.attachment.name : "";
      this.$refs.fileSpan.innerText = fileName ? fileName : "Choose a file...";
    },
    inputHandler(e) {
      if (e.keyCode === 13 && !e.shiftKey && !this.isSending) {
        e.preventDefault();
        this.sendMsg();
      }
    },
    async sendMsg() {
      if (this.content || this.attachment) {
        this.isSending = true;
        const formData = new FormData();
        if (this.attachment) formData.append("file", this.attachment);
        if (this.content) formData.append("content", this.content);
        formData.append("chat", this.$store.getters.choosenChat._id);
        try {
          const newMsg = await this.$store.dispatch("sendNewMessage", formData);
          this.$socket.emit("newMessage", newMsg);
          this.$emit("msg");
          this.clearArea();
        } catch (error) {
          this.$notify({
            type: "kick",
            group: "msgs",
            title: "Error",
            text: `Oopsie, something goes wrong...`
          });
        }
        this.isSending = false;
      }
    },
    clearArea() {
      this.content = "";
      this.attachment = "";
      this.$refs.msgContent.innerText = "";
      this.$refs.fileSpan.innerText = "Choose a file...";
    }
  }
};
</script>

<style>
.typeMess .err {
  color: rgb(231, 65, 65);
  font-size: 17px;
}
.typeMess .sendMessBtn:disabled:hover {
  cursor: default;
}
.typeMess .inputfile-2:disabled:focus + label,
.typeMess .inputfile-2.has-focus:disabled + label,
.typeMess .inputfile-2:disabled + label:hover {
  transition: none;
  background-color: inherit;
  color: #1c1f22;
  cursor: default;
}
.typeMess .slider {
  position: relative;
  top: -50px;
  left: 80px;
}
.disable {
  background-color: #dfdfdf5d;
}
.typeMess .lds-ring {
  display: inline-block;
  position: relative;
  width: 30px;
  height: 30px;
}
.typeMess .lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 50px;
  height: 50px;
  margin: 11px 0px 0px 0px;
  border: 4px solid #4eafff;
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #4eafff transparent transparent transparent;
}
</style>
