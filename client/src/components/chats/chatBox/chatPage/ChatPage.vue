<template>
  <div class="messgs">
    <delete-mess-modal></delete-mess-modal>
    <div class="chatBind">
      <div class="row">
        <div class="col-6">
          <img class="chatAva" :src="chat.chatAva" alt="chatAva">
          <span class="chName">
            <router-link :to="{ name: 'chatProfile', params: { id: chat._id } }">{{chat.chatName}}</router-link>
          </span>
        </div>
        <div class="col-6">
          <button
            v-if="isChatOwner"
            type="button"
            id="delChatBtn"
            class="btn btn-danger btn-sm float-right mt-3"
            data-toggle="modal"
            data-backdrop="static"
            data-keyboard="false"
            data-target="#delChatWindow"
            @click="deleteChatHandle"
          >
            <i class="fa fa-remove"></i>
          </button>
          <button
            ref="filterMsgsBtn"
            id="filterMsgsBtn"
            type="button"
            :class="{ focused: this.$store.getters.filter !== 'all' }"
            class="btn btn-sm float-right mt-3"
            @click.prevent="filterClicked"
          >
            <i class="fa fa-file"></i>
          </button>
          <div id="wrap" class="float-right mt-2">
            <form autocomplete="off">
              <input
                id="search"
                v-model.trim="searchString"
                name="search"
                type="text"
                ref="msgSearch"
                @keyup.esc="cancelSearch"
                placeholder="What're we looking for?"
              >
              <button class="btn srch-btn" id="search_submit" value="Rechercher" @click.prevent>
                <i class="fa fa-search"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div ref="hh" @scroll="scrollHistory" class="histWrap">
      <div ref="hist" class="chatHistory">
        <div v-if="filterMessages.length <= 0">
          <span class="selectChat">No messages here yet.</span>
        </div>
        <div v-else>
          <div v-for="(message, index) in filterMessages" :key="message._id">
            <recieved
              v-if="message.author._id !== $store.state.user._id"
              :isChatOwner="isChatOwner"
              :msg="message"
              :index="index"
            ></recieved>
            <outgoing v-else :msg="message" :index="index"></outgoing>
          </div>
        </div>
      </div>
    </div>
    <type-mess @msg="handleNewMsg"></type-mess>
  </div>
</template>

<script>
import Recieved from "./messages/RecievedMess";
import Outgoing from "./messages/OutgoingMess";
import TypeMess from "./TypeMess";
import DeleteMessModal from "./modals/DeleteMessModal";
export default {
  props: {
    chatProp: {
      type: Object,
      required: true
    }
  },
  components: {
    Recieved,
    Outgoing,
    TypeMess,
    DeleteMessModal
  },
  data() {
    return {
      searchString: "",
      isLoading: true
    };
  },
  mounted() {
    eventBus.$on("chat changed", this.setHeight);
    eventBus.$on("incomingMsg", this.setHeight);
  },
  beforeDestroy() {
    eventBus.$off("chat changed", this.setHeight);
    eventBus.$off("incomingMsg", this.setHeight);
  },
  computed: {
    isChatOwner() {
      return this.$store.state.user._id === this.chat.creator;
    },
    chat() {
      return this.$store.getters.choosenChat;
    },
    filterMessages() {
      return this.$store.getters.chatHistory.filter(message =>
        message.content.toLowerCase().includes(this.searchString.toLowerCase())
      );
    }
  },
  methods: {
    setHeight() {
      setTimeout(() => {
        this.$refs.hh.scrollTop = this.$refs.hh.scrollHeight;
      }, 190);
    },
    async scrollHistory() {
      const hist = this.$refs.hist;
      const hh = this.$refs.hh;
      const scrollTop = hh.scrollTop;
      const listHeight = hh.clientHeight;
      const allMessHeight = hist.scrollHeight;
      const scrollPercent = scrollTop / (allMessHeight - listHeight);
      const scrollPercentRounded = Math.ceil(scrollPercent * 100);
      if (
        scrollPercentRounded === 0 &&
        this.searchString.length === 0 &&
        !this.isLoading
      ) {
        this.isLoading = true;
        const oldHeight = this.$refs.hist.clientHeight;
        await this.$store.dispatch("retrieveChatHistory", {
          id: this.chat._id,
          have: this.$store.getters.chatHistory.length
        });
        this.isLoading = false;
        this.$refs.hh.scrollTop = this.$refs.hist.clientHeight - oldHeight;
      }
    },
    cancelSearch() {
      this.searchString = "";
      this.$refs.msgSearch.blur();
    },
    handleNewMsg() {
      this.searchString = "";
      this.$refs.hh.scrollTop = this.$refs.hh.scrollHeight;
    },
    filterClicked() {
      this.$store.dispatch("changeFilter");
    },
    deleteChatHandle() {
      eventBus.$emit("chatToDelete", this.chat);
    }
  }
};
</script>

<style>
.srch-btn {
  background: none;
  border: none;
}
.srch-btn i {
  color: #000000;
}
#filterMsgsBtn {
  background: none;
  border: none;
  display: inline;
}
#filterMsgsBtn:hover {
  color: #398ef0;
}
.focused {
  color: #0c79f5;
}
#filterMsgsBtn:focus {
  box-shadow: none;
}
#wrap {
  display: inline-block;
  height: 40px;
  padding: 0;
  position: relative;
}

#wrap input[type="text"] {
  height: 40px;
  font-size: 15px;
  display: inline-block;
  font-weight: 300;
  max-width: 300px;
  border: none;
  outline: none;
  color: #555;
  padding: 3px;
  padding-right: 30px;
  width: 0px;
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  z-index: 3;
  transition: width 0.5s cubic-bezier(0, 0.795, 0, 1);
  cursor: pointer;
}
#wrap i {
  margin-top: 6px;
}
#wrap input[type="text"]:focus:hover {
  border-bottom: 1px solid #bbb;
}

#wrap input[type="text"]:focus {
  width: 250px;
  z-index: 1;
  border-bottom: 1px solid #bbb;
  cursor: text;
}
.srch-btn {
  display: inline-block;
  opacity: 0.4;
  cursor: pointer;
  transition: opacity 0.5s ease;
}

.srch-btn:hover {
  opacity: 0.8;
}
#delChatBtn {
  background: none;
  color: #555;
  border: none;
  display: inline;
}
#delChatBtn:hover {
  color: rgb(241, 42, 42);
}
#delChatBtn:focus {
  box-shadow: none;
}
.histWrap {
  height: 440px;
  overflow: auto;
}
.msgaudio {
  max-width: 100%;
  max-height: 100%;
}
.inputfile + label {
  margin: 0;
  max-height: 35px;
  padding: 5px 10px;
}
.chatBind {
  overflow: hidden;
  text-align: left;
  position: relative;
  border-bottom: 1px solid #c4c4c4;
  background: #f8f8f8 none repeat scroll 0 0;
  margin: auto auto;
  padding: 11px;
  width: 100%;
}
.chatBind span {
  display: inline-block;
  font-size: 13pt;
  font-weight: bold;
  max-width: 240px;
  overflow: hidden !important;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.chName {
  position: relative;
  top: 7px;
}
.msgSearch {
  position: relative;
  display: inline-block;
  left: -4px;
  top: 1px;
  max-width: 200px;
}
.chatHistory {
  padding: 10px 20px;
  min-height: 400px;
  width: 100%;
}
.typeMess {
  padding: 10px;
  border-top: 1px solid #c4c4c4;
  position: relative;
}
.deleteMessBtn {
  padding: 1px;
  margin-bottom: 2px;
  border: none;
  background: none;
  color: red;
}
.sendMessBtn {
  background: #1c1f22 none repeat scroll 0 0;
  border: medium none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  font-size: 17px;
  height: 33px;
  width: 33px;
  float: right;
}
.messImg {
  display: inline-block;
  position: relative;
  top: -17px;
  left: -25px;
  margin: 0;
  /* margin: 0 5px 5px 0; */
}
.messAuthor {
  font-size: 12pt;
}
.receivedMess {
  padding: 0 0 0 10px;
  vertical-align: top;
  width: 92%;
  margin-bottom: 12px;
  position: relative;
  display: inline-block;
}
.receivedMess:after {
  content: "";
  width: 0px;
  height: 0px;
  position: absolute;
  border-left: 9px solid #2a6fbe;
  border-right: 9px solid transparent;
  border-top: 9px solid #2a6fbe;
  border-bottom: 9px solid transparent;
  left: 40px;
  bottom: -9px;
}
.messContent {
  position: relative;
  left: -25px;
  display: inline-block;
  width: 53%;
  background: #2a6fbe none repeat scroll 0 0;
  border-radius: 3px;
  padding: 10px 10px 5px 12px;
}
.messContent img {
  margin: auto 0;
  max-width: 100%;
  max-height: 100%;
}
.messContent p {
  margin: 0;
  color: #fff;
  font-size: 14px;
  width: 100%;
  overflow-wrap: break-word;
}
.author {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
  margin: 0;
  margin-bottom: 3px;
  font-weight: 700;
  padding: 0;
  font-style: italic;
  font-size: 14px;
  color: rgb(255, 255, 255);
}
.messContent audio {
  max-width: 100%;
}
.messContent video {
  max-width: 100%;
  max-height: 100%;
}
.timeDate {
  color: #e2e2e2;
  display: block;
  font-size: 12px;
  margin: 8px 0 0;
}
.messgs {
  float: left;
  width: 60%;
}
.writeMess {
  background: rgba(0, 0, 0, 0) none repeat scroll 0 0;
  border: medium none;
  color: #4c4c4c;
  font-size: 15px;
  min-height: 54px;
  width: 100%;
}
.message_text {
  word-wrap: break-word;
  line-height: 150%;
  white-space: pre-wrap;
}
textarea {
  resize: none;
}
</style>
