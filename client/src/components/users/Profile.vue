<template>
  <div v-if="error.length === 0">
    <div v-if="isLoading" class="container text-center mt-300">
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
    <div v-else class="container">
      <h1 align="center">{{user.login}} profile</h1>
      <div class="user-info">
        <div class="row">
          <div class="col-5">
            <div class="test float-right">
              <div class="row">
                <img :src="user.avaUrl" alt="Avatar">
              </div>
              <div v-if="editing" class="row">
                <input
                  v-validate="{ mimes: ['image/png', 'image/jpeg'], size: 10240 }"
                  data-vv-as="file"
                  name="file"
                  type="file"
                  ref="file"
                  id="file-2"
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
                  <b>Login:</b>
                </div>
                <div class="col-6">
                  <div v-if="!editing">{{user.login}}</div>
                  <input
                    v-else
                    v-model.trim="user.login"
                    v-validate="{ required: true, max: 16, min: 5, regex: /^[a-zA-Z0-9_]+$/ }"
                    class="form-control edit"
                    :class="loginClass"
                    type="text"
                    @keyup.esc="cancelEdit"
                    @keyup.enter="finishEdit"
                    name="login"
                    autofocus
                  >
                  <p class="text-danger" v-if="user.login !== undefined">{{ errors.first("login") }}</p>
                </div>
              </div>
            </span>
            <span class="data">
              <div class="row">
                <div class="col-4">
                  <b>Full name:</b>
                </div>
                <div class="col-6">
                  <div v-if="!editing">{{user.fullname}}</div>
                  <input
                    v-else
                    v-model.trim="user.fullname"
                    v-validate="{ required: true, max: 32, min: 1, regex: /^[а-яА-ЯёЁa-zA-Z\s]+$/ }"
                    class="form-control edit"
                    :class="nameClass"
                    type="text"
                    @keyup.esc="cancelEdit"
                    @keyup.enter="finishEdit"
                    name="fullname"
                  >
                  <p
                    class="text-danger"
                    v-if="user.fullname !== undefined"
                  >{{ errors.first("fullname") }}</p>
                </div>
              </div>
            </span>
            <span class="data">
              <div class="row">
                <div class="col-4">
                  <b>Role:</b>
                </div>
                <div class="col-6">
                  <div
                    v-if="!editing || (editing && (!isAdmin || accountOwner))"
                  >{{user.role == 1 ? "Admin" : "Default User"}}</div>
                  <select
                    v-else-if="editing && isAdmin && !accountOwner"
                    class="form-control edit"
                    @keyup.esc="cancelEdit"
                    @keyup.enter="finishEdit"
                    v-model="user.role"
                  >
                    <option value="0">Default User</option>
                    <option value="1">Admin</option>
                  </select>
                </div>
              </div>
            </span>
            <span class="data">
              <div class="row">
                <div class="col-4">
                  <b>Registred:</b>
                </div>
                <div class="col-6">{{registred}}</div>
              </div>
            </span>
            <span class="data">
              <div class="row">
                <div class="col-4">
                  <b>Bio:</b>
                </div>
                <div class="col-6">
                  <div class="about">
                    <div v-if="!editing">{{user.bio}}</div>
                    <textarea
                      @keyup.esc="cancelEdit"
                      @keyup.enter="finishEdit"
                      v-else
                      maxlength="70"
                      v-model.trim="user.bio"
                    ></textarea>
                  </div>
                </div>
              </div>
            </span>
          </div>
        </div>
      </div>
      <div v-if="isAdmin || accountOwner" class="text-center">
        <button v-if="editing" class="btn btn-outline-dark" @click.prevent="cancelEdit">Cancel</button>
        <button v-if="!editing" class="btn btn-outline-dark" @click.prevent="editUser">Edit</button>
        <button
          v-else
          class="btn btn-outline-dark"
          @click="finishEdit"
          :disabled="buttonActive"
        >Submit</button>
        <br>
      </div>
    </div>
  </div>
  <div v-else>
    <not-found></not-found>
  </div>
</template>

<script>
import NotFound from "../errors/404";
export default {
  name: "profile",
  props: {
    usr: {
      type: Object
    },
    id: {
      type: String
    }
  },
  components: {
    NotFound
  },
  data() {
    return {
      user: {},
      beforeEditCache: {},
      isAdmin: false,
      accountOwner: false,
      editing: false,
      isLoading: true,
      newAva: "",
      error: ""
    };
  },
  computed: {
    registred() {
      const registrationDate = new Date(this.user.registredAt);
      return `${registrationDate.toLocaleDateString()} | ${registrationDate.toLocaleTimeString()}`;
    },
    buttonActive() {
      return (
        this.errors.any() ||
        !this.user.login.length ||
        !this.user.fullname.length
      );
    },
    loginClass() {
      if (this.errors.has("login")) return { invalid: true };
      else if (!this.errors.has("login")) return { valid: true };
    },
    nameClass() {
      if (this.errors.has("fullname")) return { invalid: true };
      else if (!this.errors.has("fullname")) return { valid: true };
    }
  },
  mounted() {
    if (this.usr) {
      this.user = this.usr;
      this.isLoading = false;
      this.error = "";
      this.accountOwner = this.$store.state.user._id === this.user._id;
      this.isAdmin = !!this.$store.state.user.role;
      this.beforeEditCache = {
        login: this.user.login,
        fullname: this.user.fullname,
        bio: this.user.bio,
        role: this.user.role
      };
    } else {
      this.getUser();
    }
  },
  methods: {
    editUser() {
      this.beforeEditCache = {
        login: this.user.login,
        fullname: this.user.fullname,
        bio: this.user.bio,
        role: this.user.role
      };
      this.editing = true;
    },
    cancelEdit() {
      this.user.login = this.beforeEditCache.login;
      this.user.fullname = this.beforeEditCache.fullname;
      this.user.role = this.beforeEditCache.role;
      this.user.bio = this.beforeEditCache.bio;
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
      this.editing = false;
      if (
        (this.user.login !== this.beforeEditCache.login ||
          this.user.fullname !== this.beforeEditCache.fullname ||
          this.user.bio !== this.beforeEditCache.bio ||
          this.user.role !== this.beforeEditCache.role ||
          this.newAva) &&
        !this.errors.any()
      ) {
        try {
          this.isLoading = true;
          const formData = new FormData();
          if (this.newAva) formData.append("image", this.newAva);
          formData.append("login", this.user.login);
          formData.append("fullname", this.user.fullname);
          formData.append("bio", this.user.bio);
          formData.append("role", this.user.role);
          const updated = await this.$store.dispatch("updateUser", {
            userId: this.user._id,
            formData
          });
          if (updated.avaUrl !== this.user.avaUrl)
            this.user.avaUrl = updated.avaUrl;
        } catch (error) {
          console.log(error);
        }
        this.isLoading = false;
      }
    },
    async getUser() {
      const id = this.$route.params.id;
      if (id.length) {
        try {
          const user = await this.$store.dispatch("getUserByID", id);
          this.error = "";
          this.isLoading = false;
          this.user = user;
          this.accountOwner = this.$store.state.user._id === this.user._id;
          this.isAdmin = !!this.$store.state.user.role;
          this.beforeEditCache = {
            login: this.user.login,
            fullname: this.user.fullname,
            bio: this.user.bio,
            role: this.user.role
          };
        } catch (error) {
          console.log(error);
          this.error = error;
        }
      }
    }
  },
  watch: {
    async "user.login"(value) {
      if (
        !this.errors.has("login") &&
        value !== this.beforeEditCache.login &&
        value.length !== 0
      ) {
        try {
          const isExist = await this.$store.dispatch("isUsernameExist", value);
          if (isExist) {
            const field = this.$validator.fields.find({ name: "login" });
            field.setFlags({ invalid: true });
            this.errors.add({
              field: "login",
              msg: "Sorry, but this username already exists",
              id: field.id,
              scope: field.scope
            });
          }
        } catch (error) {
          console.log(error);
        }
      }
    },
    $route(to, from) {
      this.getUser();
    }
  }
};
</script>

<style lang="css">
.mt-300 {
  margin: 300px auto;
}
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
</style>
