<template>
  <div id="app">
    <Navigation></Navigation>
    <router-view></router-view>
    <notifications group="msgs" position="top right" classes="notif"/>
  </div>
</template>

<script>
import Navigation from "./components/Navigation.vue";
export default {
  name: "app",
  data() {
    return {};
  },
  created() {
    this.$store
      .dispatch("getLoggedUser")
      .then(id => {
        this.$socket.emit("loggedUser", id);
      })
      .catch(error => {
        console.error(error);
      });
    if (!this.$store.getters.chats.length) {
      this.$store.dispatch("retrieveChats").catch(error => {
        console.log(error);
      });
    }
  },
  sockets: {
    connect() {
      if (this.$store.state.user._id) {
        this.$socket.emit("loggedUser", this.$store.state.user._id);
      }
    },
    async newMessage(message) {
      if (
        !this.$store.getters.isAnyChatChoosen ||
        this.$router.currentRoute.name !== "chats" ||
        (this.$store.getters.isAnyChatChoosen &&
          this.$store.getters.choosenChat._id !== message.chat)
      ) {
        let chat = this.$store.getters.chatById(message.chat);
        if (!chat) {
          try {
            const response = await this.$store.dispatch("getChatById", {
              id: message.chat,
              mutation: "add"
            });
            chat = response.chat;
          } catch (error) {
            console.log(error);
          }
        }
        this.notify(chat.chatName, message.author.login, message.content);
      } else if (
        this.$store.getters.isAnyChatChoosen &&
        this.$store.getters.choosenChat._id === message.chat
      ) {
        eventBus.$emit("incomingMsg");
      }
    },
    newChat(chat) {
      if (chat.members.includes(this.$store.state.user._id)) {
        this.$socket.emit("joinChat", chat);
      }
    },
    joinChat(chat) {
      this.invited(chat.chatName);
    },
    deleteChat(chatID) {
      this.$socket.emit("leaveChat", chatID);
    },
    leaveChat(chatID) {
      const chat = this.$store.getters.chatById(chatID);
      if (chat) {
        this.kicked(chat.chatName);
      }
    },
    updateChat(chat) {
      const localChat = this.$store.getters.chatById(chat._id);
      const me = this.$store.getters.me;
      if (localChat) {
        if (chat.members.includes(me._id)) {
          this.updated(localChat, chat);
        } else {
          this.$socket.emit("leaveChat", chat._id);
        }
      } else {
        if (chat.members.includes(me._id)) {
          this.$socket.emit("joinChat", chat);
        } else {
          this.$socket.emit("maybeLeaveChat", chat._id);
        }
      }
    }
  },
  components: {
    Navigation
  },
  methods: {
    notify(chatName, author, message) {
      const msg = message ? message : "Media File";
      this.$notify({
        type: "new-message",
        group: "msgs",
        title: `New Message in "${chatName}"`,
        text: `${author}: ${msg}`
      });
    },
    invited(chatName) {
      this.$notify({
        type: "invite",
        group: "msgs",
        title: "New invite!",
        text: `You have been invited to the "${chatName}"`
      });
    },
    kicked(chatName) {
      this.$notify({
        type: "kick",
        group: "msgs",
        title: "Kick",
        text: `You have been kicked from "${chatName}"`
      });
    },
    updated(oldChat, newChat) {
      let text = `${oldChat.chatName} has been updated!`;
      text +=
        newChat.chatName !== oldChat.chatName
          ? ` New chat name: ${newChat.chatName}.
      for more info check chat profile`
          : "";
      this.$notify({
        type: "update",
        group: "msgs",
        title: "Chat Update",
        text: text
      });
    }
  }
};
</script>



<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
div.reg {
  display: -ms-flexbox;
  display: -webkit-box;
  display: flex;
  -ms-flex-align: center;
  -ms-flex-pack: center;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  padding-top: 40px;
  padding-bottom: 40px;
  background-color: #f5f5f5;
}

.form-signin {
  width: 100%;
  max-width: 530px;
  padding: 15px;
  margin: 0 auto;
}
.form-signin .checkbox {
  font-weight: 400;
}
.form-signin .form-control {
  position: relative;
  box-sizing: border-box;
  height: auto;
  padding: 10px;
  font-size: 16px;
}
.form-signin .form-control:focus {
  z-index: 2;
}
.form-signin input[type="email"] {
  margin-bottom: -1px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
.form-signin input[type="password"]#pass,
#logPass {
  margin-bottom: 20px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.lds-ring {
  display: inline-block;
  position: relative;
  width: 20px;
  height: 20px;
}
.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 20px;
  height: 20px;
  margin: 5px 0px 0px 0px;
  border: 2px solid #fff;
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #fff transparent transparent transparent;
}
.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}
.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}
.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.inputfile {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}
.inputfile + label {
  max-width: 180px;
  margin-top: 5px;
  font-size: 15px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  display: inline-block;
  overflow: hidden;
  padding: 10px 20px;
  border-radius: 4px;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
.inputfile:focus + label,
.inputfile.has-focus + label {
  outline: 1px dotted #000;
  outline: -webkit-focus-ring-color auto 5px;
}
.inputfile + label svg {
  width: 1em;
  height: 1em;
  vertical-align: middle;
  fill: currentColor;
  margin-top: -4px;
  margin-right: 4px;
}
.inputfile-2 + label {
  color: #1c1f22;
  border: 1px solid currentColor;
}
.inputfile-2:focus + label,
.inputfile-2.has-focus + label,
.inputfile-2 + label:hover {
  background-color: #1f1f1f;
  color: #f0f0f0;
}
.valid {
  border: 2px solid rgba(12, 143, 12, 0.849);
}
.invalid {
  border: 2px solid rgba(255, 65, 65, 0.87);
}
.notif {
  padding: 10px;
  margin: 0 5px 5px;
  font-size: 12px;
  color: #ffffff;
  background: #44a4fc;
  border-left: 7px solid #187fe7;
}
.notif .notification-title {
  font-size: 17px;
}
.notif .notification-content {
  font-size: 15px;
}
.notif.new-message {
  color: #ffffff;
  background: #1397f5;
  border-left: 5px solid #2c71a3;
}
.notif.invite {
  color: #ffffff;
  background: #10b95c;
  border-left: 5px solid #0a7c3e;
}
.notif.kick {
  color: #ffffff;
  background: #ee2a4a;
  border-left: 5px solid #c90f2e;
}

.notif.update {
  color: #1b1b1b;
  background: #eeeeee;
  border-left: 5px solid #a1a1a1;
}
h1,
h2 {
  font-weight: normal;
}
</style>
