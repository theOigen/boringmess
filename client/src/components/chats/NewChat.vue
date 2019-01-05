<template>
  <div v-if="!isLoading" class="container">
    <h1 align="center">Create Chat</h1>
    <div class="central">
      <form class="createChatForm" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="chatName">Chat name</label>
          <input
            id="ch_name"
            v-model.trim="name"
            v-validate="{ required: true, min: 1, max:32 }"
            type="text"
            class="form-control"
            :class="nameClass"
            name="chatName"
            placeholder="Input chat name"
          >
          <span class="text-danger" v-if="name.length">{{errors.first("chatName")}}</span>
        </div>
        <div class="form-group">
          <label for="chat-tag">Chat tag</label>
          <input
            id="ch_tag"
            type="text"
            v-model.trim="tag"
            v-validate="{ required: true, min:3, max: 15, regex: /^[a-zA-Z0-9_]+$/ }"
            class="form-control"
            :class="tagClass"
            name="chat-tag"
            placeholder="Input tag"
            title="You should use just letters, numbers and underscores."
          >
          <span class="text-danger" v-if="tag.length">{{errors.first("chat-tag")}}</span>
        </div>
        <div class="form-group">
          <label>Members</label>
          <div>
            <multiselect
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
              <span slot="noResult">Oops! No elements found. Consider changing the search query.</span>
            </multiselect>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <label for="file">Chat avatar</label>
          </div>
          <div class="col">
            <div class="float-right">
              <input
                type="file"
                ref="file"
                name="file"
                id="file-2"
                v-validate="{ required: true, mimes: ['image/png', 'image/jpeg'], size: 10240 }"
                data-vv-as="file"
                @change="handleFileUpload()"
                accept="image/png, image/jpeg"
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
          </div>
          <div v-if="errors.has('file')" class="text-center">
            <span class="text-danger filErr">{{ errors.first("file") }}</span>
          </div>
        </div>
        <p class="text-danger mb-2" v-if="error.length">{{error}}</p>
        <div class="container text-center">
          <button
            id="createBtn"
            :disabled="buttonActive"
            type="submit"
            class="btn btn-outline-dark"
          >Create</button>
        </div>
      </form>
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
</template>

<script>
import Multiselect from "vue-multiselect";
export default {
  data() {
    return {
      name: "",
      tag: "",
      avatar: "",
      error: "",
      members: [],
      users: [],
      isLoading: false,
      isSearching: false
    };
  },
  mounted() {},
  components: {
    Multiselect
  },
  computed: {
    membersID() {
      return this.members.map(member => member._id);
    },
    tagClass() {
      if (this.errors.has("chat-tag") && this.tag.length !== 0)
        return { invalid: true };
      else if (!this.errors.has("chat-tag") && this.tag.length !== 0)
        return { valid: true };
    },
    nameClass() {
      if (this.errors.has("chatName") && this.name.length !== 0)
        return { invalid: true };
      else if (!this.errors.has("chatName") && this.name.length !== 0)
        return { valid: true };
    },
    buttonActive() {
      return (
        this.errors.any() ||
        !this.tag.length ||
        !this.name.length ||
        !this.avatar ||
        !this.members.length
      );
    }
  },
  watch: {
    async tag(value) {
      if (
        (!this.errors.has("chat-tag") && value.length >= 3) ||
        value.length >= 3
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
          console.log(error);
        }
      }
    }
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
      this.name = "";
      this.tag = "";
      this.avatar = "";
      this.$refs.fileSpan.innerText = "Choose a file...";
      this.members = [];
    },
    handleFileUpload(e) {
      this.avatar = this.$refs.file.files[0];
      if (this.avatar) {
        this.$refs.fileSpan.innerText = this.avatar.name;
      } else {
        this.$refs.fileSpan.innerText = "Choose a file...";
      }
    },
    async handleSubmit() {
      if (
        this.tag.length &&
        this.name.length &&
        this.members.length &&
        this.avatar &&
        !this.errors.any()
      ) {
        try {
          this.isLoading = true;
          const formData = new FormData();
          formData.append("about", "");
          formData.append("chatName", this.name);
          formData.append("shareName", this.tag);
          formData.append("image", this.avatar);
          formData.append("members", JSON.stringify(this.membersID));
          const chat = await this.$store.dispatch("createChat", formData);
          this.$socket.emit("newChat", chat);
          this.$router.push("/chats");
          this.clearAll();
        } catch (error) {
          this.error = error;
        }
        this.isLoading = false;
      }
    }
  }
};
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<style>
.filErr {
  margin: 0 121px;
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
.central {
  margin: 20px auto;
  max-width: 500px;
}
.inputfile + label {
  margin: 0;
  max-height: 35px;
  padding: 5px 10px;
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
