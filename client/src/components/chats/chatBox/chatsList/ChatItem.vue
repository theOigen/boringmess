<template>
  <a href="#" ref="selChat" @click.prevent="handleClick(chat)">
    <div id="isActiveChat" ref="chatDiv" class="chatList" :class="{activeChat : chatChoosen}">
      <div class="chatInterlocutor">
        <div class="chatImg">
          <img class="chatPreviewPic" :src="chat.chatAva" alt="chat ava">
        </div>
        <div class="chatPreview">
          <h5>
            <span class="chatName">{{chat.chatName}}</span>
            <span>
              (@{{chat.shareName}})
              {{dateCreation}}
            </span>
          </h5>
          <p id="LastMess">{{chat.lastMessage}}</p>
        </div>
      </div>
    </div>
  </a>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {};
  },
  methods: {
    async handleClick(chat) {
      if (chat._id !== this.$store.getters.choosenChat._id) {
        try {
          await this.$store.dispatch("chooseChat", chat);
          await this.$store.dispatch("retrieveChatHistory", chat._id);
          eventBus.$emit("chat changed");
        } catch (err) {
          this.$notify({
            type: "error",
            group: "msgs",
            title: "Error",
            text: `Oopsie, something goes wrong...`
          });
        }
      }
    }
  },
  computed: {
    chatChoosen() {
      return this.chat._id === this.$store.getters.choosenChat._id;
    },
    chat() {
      return this.$store.getters.chats.find(chat => chat._id === this.id);
    },
    dateCreation() {
      const date = new Date(this.chat.created);
      const month = date.toLocaleString("en-us", { month: "short" });
      return `${month} ${date.getDate()}`;
    }
  }
};
</script>

<style>
</style>

