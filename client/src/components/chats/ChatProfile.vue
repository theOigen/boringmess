<template>
  <div v-if="error.length === 0">
    <div v-if="!isLoading" class="container">
      <h1 align="center">{{chat.chatName}} profile</h1>
      <div class="user-info">
        <div class="row">
          <div class="col-5">
            <div class="test float-right">
              <div class="row">
                <img :src="chat.chatAva" alt="Avatar">
              </div>
              <div v-if="editing" class="row">
                <input
                  type="file"
                  ref="file"
                  id="file-2"
                  name="file"
                  v-validate="{ mimes: ['image/png', 'image/jpeg'], size: 10240 }"
                  data-vv-as="file"
                  @change="handleFileUpload()"
                  @keyup.esc="cancelEdit"
                  accept="image/png, image/jpeg"
                  class="inputfile inputfile-2"
                >
                <label for="file-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="17"
                    viewBox="0 0 20 17"
                  >
                    <path
                      d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"
                    ></path>
                  </svg>
                  <span ref="fileSpan">Choose a file&hellip;</span>
                </label>
              </div>
              <div class="row fileErr">
                <span class="text-danger" v-if="newAva">{{ errors.first("file") }}</span>
              </div>
            </div>
          </div>
          <div class="col-7">
            <span class="data">
              <div class="row">
                <div class="col-4">
                  <b>Tag:</b>
                </div>
                <div class="col-6">
                  <div v-if="!editing">{{chat.shareName}}</div>
                  <input
                    v-else
                    type="text"
                    @keyup.esc="cancelEdit"
                    @keyup.enter="finishEdit"
                    name="chat-tag"
                    class="form-control edit"
                    v-validate="{ required: true, min:3, max: 15, regex: /^[a-zA-Z0-9_]+$/ }"
                    :class="tagClass"
                    autofocus
                    v-model.trim="chat.shareName"
                  >
                  <span
                    class="text-danger"
                    v-if="chat.shareName !== undefined"
                  >{{ errors.first("chat-tag") }}</span>
                </div>
              </div>
            </span>
            <span class="data">
              <div class="row">
                <div class="col-4">
                  <b>Chat name:</b>
                </div>
                <div class="col-6">
                  <div v-if="!editing">{{chat.chatName}}</div>
                  <input
                    v-else
                    type="text"
                    @keyup.esc="cancelEdit"
                    @keyup.enter="finishEdit"
                    name="chatName"
                    class="form-control edit"
                    :class="nameClass"
                    v-validate="{ required: true, min: 1, max:32 }"
                    v-model.trim="chat.chatName"
                  >
                  <span
                    class="text-danger"
                    v-if="chat.chatName !== undefined"
                  >{{ errors.first("chatName") }}</span>
                </div>
              </div>
            </span>
            <span class="data"></span>
            <span class="data">
              <div class="row">
                <div class="col-4">
                  <b>Created:</b>
                </div>
                <div class="col-6">{{registred}}</div>
              </div>
            </span>
            <span class="data">
              <div class="row">
                <div class="col-4">
                  <b>About:</b>
                </div>
                <div class="col-6">
                  <div class="about">
                    <div v-if="!editing">{{chat.about}}</div>
                    <textarea
                      @keyup.esc="cancelEdit"
                      @keyup.enter="finishEdit"
                      v-else
                      maxlength="70"
                      v-model.trim="chat.about"
                    ></textarea>
                  </div>
                </div>
              </div>
            </span>
            <span class="data">
              <div class="row">
                <div class="col-4">
                  <b>Members:</b>
                </div>
                <div class="col-6">
                  <multiselect
                    :disabled="!editing"
                    class="members"
                    v-model="members"
                    id="ajax"
                    label="login"
                    track-by="_id"
                    placeholder="Type to search"
                    open-direction="bottom"
                    :options="users"
                    :multiple="true"
                    :searchable="true"
                    :loading="isSearching"
                    :internal-search="false"
                    :clear-on-select="false"
                    :close-on-select="false"
                    :options-limit="10"
                    :limit="3"
                    :limit-text="limitText"
                    :max-height="600"
                    :show-no-results="false"
                    :hide-selected="true"
                    @search-change="asyncFind"
                  >
                    <template slot="tag" slot-scope="{ option, remove }">
                      <span class="custom__tag">
                        <span>{{ option.login }}</span>
                        <span class="custom__remove" @click="remove(option)">
                          <i class="fa fa-remove"></i>
                        </span>
                      </span>
                    </template>
                    <template slot="clear" slot-scope="props">
                      <div
                        class="multiselect__clear"
                        v-if="members.length"
                        @mousedown.prevent.stop="clearAll(props.search)"
                      ></div>
                    </template>
                    <span
                      slot="noResult"
                    >Oops! No elements found. Consider changing the search query.</span>
                  </multiselect>
                </div>
              </div>
            </span>
          </div>
        </div>
      </div>
      <div v-if="chatOwner" class="text-center">
        <button v-if="editing" class="btn btn-outline-dark" @click.prevent="cancelEdit">Cancel</button>
        <button v-if="!editing" class="btn btn-outline-dark" @click.prevent="editChat">Edit</button>
        <button
          v-else
          class="btn btn-outline-dark"
          @click.prevent="finishEdit"
          :disabled="buttonActive"
        >Submit</button>
        <br>
      </div>
    </div>
    <div v-else class="container text-center mt-300">
      <div class="lds-roller">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  </div>
  <div v-else>
    <not-found></not-found>
  </div>
</template>

<script>
import Multiselect from "vue-multiselect";
import NotFound from "../errors/404";
export default {
  name: "chatProfile",
  props: {
    id: {
      type: String
    }
  },
  components: {
    Multiselect,
    NotFound
  },
  data() {
    return {
      chat: {},
      members: [],
      users: [],
      beforeEditCache: {},
      chatOwner: false,
      editing: false,
      isSearching: false,
      isLoading: true,
      newAva: "",
      error: ""
    };
  },
  computed: {
    registred() {
      const registrationDate = new Date(this.chat.created);
      return `${registrationDate.toLocaleDateString()} | ${registrationDate.toLocaleTimeString()}`;
    },
    buttonActive() {
      return (
        this.errors.any() ||
        !this.chat.shareName.length ||
        !this.chat.chatName.length ||
        !this.members.length
      );
    },
    tagClass() {
      if (this.errors.has("chat-tag")) return { invalid: true };
      else if (!this.errors.has("chat-tag")) return { valid: true };
    },
    nameClass() {
      if (this.errors.has("chatName")) return { invalid: true };
      else if (!this.errors.has("chatName")) return { valid: true };
    },
    membersID() {
      return this.members.map(member => member._id);
    }
  },
  mounted() {
    this.getChat();
  },
  methods: {
    limitText(count) {
      return `and ${count} other users`;
    },
    asyncFind(query) {
      this.isSearching = true;
      this.$store
        .dispatch("getAllUsers", { page: 1, search: query })
        .then(response => {
          this.users = response.users;
          this.isSearching = false;
        });
    },
    clearAll() {
      this.members = [];
    },
    editChat() {
      this.beforeEditCache = {
        chatName: this.chat.chatName,
        shareName: this.chat.shareName,
        about: this.chat.about,
        chatAva: this.chat.chatAva,
        members: this.chat.members
      };
      this.editing = true;
    },
    cancelEdit() {
      this.chat.shareName = this.beforeEditCache.shareName;
      this.chat.chatName = this.beforeEditCache.chatName;
      this.chat.members = this.beforeEditCache.members;
      this.members = this.beforeEditCache.members;
      this.chat.about = this.beforeEditCache.about;
      this.newAva = "";
      this.editing = false;
    },
    handleFileUpload() {
      this.newAva = this.$refs.file.files[0];
      if (this.newAva) {
        this.$refs.fileSpan.innerText = this.newAva.name;
      } else {
        this.$refs.fileSpan.innerText = "Choose a file...";
      }
    },
    async finishEdit() {
      if (
        (this.chat.shareName !== this.beforeEditCache.shareName ||
          this.chat.chatName !== this.beforeEditCache.chatName ||
          this.chat.about !== this.beforeEditCache.about ||
          this.members !== this.beforeEditCache.members ||
          this.newAva) &&
        !this.errors.any()
      ) {
        try {
          this.isLoading = true;
          this.editing = false;
          const formData = new FormData();
          if (this.newAva) formData.append("image", this.newAva);
          formData.append("chatName", this.chat.chatName);
          formData.append("shareName", this.chat.shareName);
          formData.append("about", this.chat.about);
          formData.append("members", JSON.stringify(this.membersID));
          const updated = await this.$store.dispatch("updateChat", {
            chatId: this.chat._id,
            formData
          });
          this.$socket.emit("updateChat", updated);
          if (updated.chatAva !== this.chat.chatAva)
            this.chat.chatAva = updated.chatAva;
        } catch (error) {
          console.error(error);
        }
        this.isLoading = false;
      }
    },
    async getChat() {
      const id = this.$route.params.id;
      if (id.length) {
        try {
          const response = await this.$store.dispatch("getChatById", {
            id,
            mutation: "none"
          });
          this.chat = response.chat;
          this.error = "";
          this.isLoading = false;
          this.chatOwner = response.isChatOwner;
          this.members = response.chat.members;
          this.beforeEditCache = {
            chatName: this.chat.chatName,
            shareName: this.chat.shareName,
            about: this.chat.about,
            chatAva: this.chat.chatAva,
            members: this.chat.members
          };
        } catch (error) {
          this.error = error;
          this.chat = {};
        }
      }
    }
  },
  watch: {
    async "chat.shareName"(value) {
      if (
        (!this.errors.has("chat-tag") &&
          value !== this.beforeEditCache.shareName &&
          value.length !== 0) ||
        (value.length !== 0 && value !== this.beforeEditCache.shareName)
      ) {
        try {
          const isExist = await this.$store.dispatch("isChatExist", value);
          if (isExist) {
            const field = this.$validator.fields.find({ name: "chat-tag" });
            field.setFlags({ invalid: true });
            this.errors.add({
              field: "chat-tag",
              msg: "Sorry, but this tag already exists",
              id: field.id,
              scope: field.scope
            });
          }
        } catch (error) {
          console.error(error);
        }
      }
    },
    $route(to, from) {
      this.getChat();
    }
  }
};
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style lang="css">
.fileErr {
  max-width: 200px;
}
.text-danger {
  font-size: 15px;
}
.edit {
  max-height: 25px;
}
.edit[type="text"] {
  border-style: solid;
  border-width: 1px;
  background-color: inherit;
}
div.user-info {
  padding: 10px;
}
div.about textarea {
  width: 100%;
  border: none;
  height: 200px;
}
div.user-info span.data {
  font-size: 13pt;
  margin-top: 20px;
  display: block;
}
div.user-info img {
  height: 185px;
  width: 185px;
  border-radius: 50%;
  float: right;
  clear: both;
}
img.updAva {
  height: 165px;
  width: 165px;
  float: none;
}
div.about {
  margin: auto;
  max-width: 450px;
  min-height: 200px;
  padding: 15px;
  border: 1px solid #a8a8a8;
  background-color: white;
  border-radius: 4px;
  overflow-y: auto;
  word-wrap: break-word;
}
div.about textarea {
  width: 100%;
  border: none;
  max-height: 160px;
  resize: none;
}
a.table_user_login {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mt-300 {
  margin: 300px auto;
}
.createChatForm {
  max-width: 500px;
}
.lds-roller {
  display: inline-block;
  position: relative;
  width: 64px;
  height: 64px;
}
.lds-roller div {
  animation: lds-roller 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  transform-origin: 32px 32px;
}
.lds-roller div:after {
  content: " ";
  display: block;
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgb(24, 23, 23);
  margin: -3px 0 0 -3px;
}
.lds-roller div:nth-child(1) {
  animation-delay: -0.036s;
}
.lds-roller div:nth-child(1):after {
  top: 50px;
  left: 50px;
}
.lds-roller div:nth-child(2) {
  animation-delay: -0.072s;
}
.lds-roller div:nth-child(2):after {
  top: 54px;
  left: 45px;
}
.lds-roller div:nth-child(3) {
  animation-delay: -0.108s;
}
.lds-roller div:nth-child(3):after {
  top: 57px;
  left: 39px;
}
.lds-roller div:nth-child(4) {
  animation-delay: -0.144s;
}
.lds-roller div:nth-child(4):after {
  top: 58px;
  left: 32px;
}
.lds-roller div:nth-child(5) {
  animation-delay: -0.18s;
}
.lds-roller div:nth-child(5):after {
  top: 57px;
  left: 25px;
}
.lds-roller div:nth-child(6) {
  animation-delay: -0.216s;
}
.lds-roller div:nth-child(6):after {
  top: 54px;
  left: 19px;
}
.lds-roller div:nth-child(7) {
  animation-delay: -0.252s;
}
.lds-roller div:nth-child(7):after {
  top: 50px;
  left: 14px;
}
.lds-roller div:nth-child(8) {
  animation-delay: -0.288s;
}
.lds-roller div:nth-child(8):after {
  top: 45px;
  left: 10px;
}
@keyframes lds-roller {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.multiselect__clear {
  position: absolute;
  right: 41px;
  height: 20px;
  width: 20px;
  display: block;
  cursor: pointer;
  z-index: 2;
}
.multiselect__clear:after,
.multiselect__clear:before {
  content: "";
  display: block;
  position: absolute;
  width: 3px;
  height: 16px;
  background: #aaa;
  top: 12px;
  right: 4px;
}
.multiselect__clear:before {
  transform: rotate(45deg);
}
.multiselect__clear:after {
  transform: rotate(-45deg);
}
.members {
  max-width: 100%;
}
.custom__tag {
  display: inline-block;
  padding: 3px 12px;
  background: #1f1f1f;
  margin-right: 8px;
  margin-bottom: 8px;
  border-radius: 4px;
  cursor: pointer;
  color: aliceblue;
}
.multiselect__tag,
.multiselect__option--highlight,
.multiselect__option--highlight:after {
  background: #54bef0;
}
.multiselect__option--selected.multiselect__option--highlight,
.multiselect__option--selected.multiselect__option--highlight:after {
  background: #3985a8;
}
</style>
