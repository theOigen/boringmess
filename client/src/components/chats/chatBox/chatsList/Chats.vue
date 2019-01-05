<template>
  <div class="container">
    <h1 align="center">Chats</h1>
    <div class="messaging">
      <div class="inboxMess">
        <div class="inboxUsers">
          <div class="searchBind">
            <div class="searchBar">
              <div class="container">
                <div class="input-group mb-2">
                  <input
                    v-model.trim="searchResult"
                    type="text"
                    class="form-control"
                    placeholder="Search"
                    name="search"
                    ref="chatSearch"
                    @keyup.esc="cancelSearch"
                    maxlength="16"
                  >
                </div>
                <div
                  v-if="searchResult.length !== 0"
                  class="result text-center"
                >Search result by chat login: {{searchResult}}</div>
              </div>
            </div>
            <div>
              <router-link
                to="/chats/new"
                class="btn btn-primary btn-sm float-right createBtn"
                :class="{'mt-3': searchResult.length === 0}"
              >
                <i class="fa fa-pencil" aria-hidden="true"></i>
              </router-link>
            </div>
          </div>
          <div ref="chatsList" @scroll="getNextChats" class="inboxChat">
            <div ref="all_chats">
              <div v-if="!filterChats.length">
                <p align="center">No chats here yet.</p>
              </div>
              <chat-item
                v-for="chat in filterChats"
                :key="chat._id"
                :chatProp="chat"
                :id="chat._id"
              ></chat-item>
            </div>
          </div>
        </div>
        <delete-chat-modal></delete-chat-modal>
        <div v-if="!anyChatChoosen" id="chatPage" class="messgs">
          <span class="selectChat">Select a chat to start messaging.</span>
        </div>
        <chat-page v-else :chatProp="$store.getters.choosenChat"></chat-page>
      </div>
    </div>
  </div>
</template>

<script>
import ChatItem from "./ChatItem";
import ChatPage from "../chatPage/ChatPage";
import DeleteChatModal from "../chatPage/modals/DeleteChatModal";
export default {
  name: "chats",
  data() {
    return {
      searchResult: ""
    };
  },
  components: {
    ChatItem,
    ChatPage,
    DeleteChatModal
  },
  created() {},
  methods: {
    async getNextChats() {
      const chatsList = this.$refs.chatsList;
      const scrollTop = chatsList.scrollTop;
      const listHeight = chatsList.clientHeight;
      const allChatsHeight = this.$refs.all_chats.clientHeight;
      const scrollPercent = scrollTop / (allChatsHeight - listHeight);
      const scrollPercentRounded = Math.round(scrollPercent * 100);
      if (scrollPercentRounded === 100) {
        try {
          await this.$store.dispatch(
            "retrieveChats",
            this.$store.getters.chats.length
          );
        } catch (error) {
          this.$notify({
            type: "error",
            group: "msgs",
            title: "Error",
            text: `Oopsie, something goes wrong...`
          });
        }
      }
    },
    cancelSearch() {
      this.searchResult = "";
      this.$refs.chatSearch.blur();
    }
  },
  computed: {
    anyChatChoosen() {
      return this.$store.getters.isAnyChatChoosen;
    },
    filterChats() {
      return this.$store.getters.chats.filter(chat =>
        chat.shareName.toLowerCase().includes(this.searchResult.toLowerCase())
      );
    }
  }
};
</script>

<style lang="css">
.result {
  color: rgb(167, 167, 167);
  font-size: 10pt;
}
.notfound {
  font-size: 13pt;
  margin: auto;
}
img.chatPic {
  max-width: 70%;
  border-radius: 3px;
}
img.chatAva {
  width: 60px;
  height: 60px;
  border-radius: 50%;
}
img.chatPreviewPic {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.inboxUsers {
  background: #f8f8f8 none repeat scroll 0 0;
  float: left;
  overflow: hidden;
  width: 40%;
  border-right: 1px solid #c4c4c4;
}
.inboxMess {
  border: 1px solid #c4c4c4;
  clear: both;
  overflow: hidden;
}
.recent {
  float: left;
  width: 40%;
}
.createBtn {
  display: block;
  position: relative;
  top: -45px;
  left: -10px;
  margin: auto;
}
.searchBar {
  position: relative;
  width: 90%;
  margin: 15px 0 -15px;
}
.searchBind {
  overflow: hidden;
  border-bottom: 1px solid #c4c4c4;
}
.searchBar input {
  border: 1px solid #cdcdcd;
  padding: 2px 0 4px 6px;
}
.searchBar .input-group-addon button {
  border: medium none;
  padding: 0;
  color: #707070;
  font-size: 18px;
}
.searchBar .input-group-addon {
  margin: 0 0 0 -27px;
}
.chatPreview h5 {
  font-size: 15px;
  font-weight: bold;
  color: #464646;
  margin: 0 0 8px 0;
  overflow: hidden;
}
.chatPreview h5 span {
  font-size: 13px;
  float: right;
}
.chatPreview span.chatName {
  max-width: 180px;
  float: left;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chatPreview p {
  font-size: 14px;
  color: #989898;
  margin: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.activeChat {
  background: #2b80ff;
}
.activeChat p,
.activeChat span.chatName,
.activeChat h5 {
  color: white;
}
.chatImg {
  float: left;
  width: 11%;
}
.chatPreview {
  float: left;
  padding: 0 0 0 15px;
  width: 88%;
}
.chatInterlocutor {
  overflow: hidden;
  clear: both;
}
.chatList {
  border-bottom: 1px solid #c4c4c4;
  margin: 0;
  padding: 18px 16px 10px;
}
.inboxChat {
  height: 549px;
  overflow-y: auto;
}
.selectChat {
  /* display: block; */
  font-size: 20px;
  position: relative;
  top: 210px;
  left: 200px;
  text-align: center;
}
.linkButton {
  background: none;
  border: none;
  color: #0066ff;
  text-decoration: none;
  cursor: pointer;
}
.senderAva {
  border-radius: 50%;
  width: 20px;
  height: 20px;
}
.messaging {
  padding: 0 0 50px 0;
}
</style>
