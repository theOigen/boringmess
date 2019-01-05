<template>
  <div>
    <h1 align="center">Users</h1>
    <div v-if="isLoading" class="container text-center mt-200">
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
    <div class="container" v-else>
      <div class="container">
        <div class="input-group mb-2">
          <input
            v-model.trim="searchResult"
            type="text"
            class="form-control"
            placeholder="Search"
            name="search"
            maxlength="16"
          >
        </div>
        <div class="result text-center mb-2">Search result by login: {{searchResult}}</div>
      </div>
      <table v-if="users.length" class="table table-bordered u-table">
        <thead>
          <tr class="bg-primary">
            <th scope="col">Login</th>
            <th scope="col">Fullname</th>
            <th scope="col">Registred</th>
          </tr>
        </thead>
        <tbody>
          <tr class="bg-primary" v-for="user in users" :key="user._id">
            <td>
              <span class="online-dot"></span>
              <router-link
                class="userlink"
                :to="{ name: 'profile', params: { usr: user, id: user._id } }"
              >{{user.login}}</router-link>
            </td>
            <td>{{user.fullname}}</td>
            <td>{{registred(user)}}</td>
          </tr>
        </tbody>
      </table>
      <div v-else>
        <div class="notfound text-center">No users with login {{searchResult}}</div>
      </div>
      <!-- <div v-if="users.length" id="pagination" class="row justify-content-center">
        <nav aria-label="Page navigation example" align="center">
          <ul class="pagination">
            <li class="page-item" :class="{disabled : prevPage <= 0}">
              <a id="prevPage" class="page-link" href="#" @click.prevent="prev">Prev</a>
            </li>
            <li class="page-item active">
              <a id="currentPage" class="page-link" href="#">{{currPage}}</a>
            </li>
            <li class="page-item" :class="{disabled : nextPage <= 0}">
              <a id="nextPage" class="page-link" href="#" @click.prevent="next">Next</a>
            </li>
          </ul>
        </nav>
      </div>-->
      <pagination
        v-if="users.length"
        class="center"
        :current="currPage"
        :total="totalPages"
        :page-range="pageRange"
        :active-font-color="'white'"
        :active-color="'#007DFF'"
        @page-changed="getUsers"
      ></pagination>
    </div>
  </div>
</template>

<script>
import Pagination from "./Pagination";
export default {
  name: "user",
  components: {
    Pagination
  },
  data() {
    return {
      users: [],
      currPage: -1,
      nextPage: -1,
      prevPage: -1,
      totalPages: 0,
      pageRange: 1,
      searchResult: "",
      isLoading: false
    };
  },
  mounted() {
    this.getUsers(1, this.searchResult);
  },
  watch: {
    searchResult(value) {
      if (value.length >= 0) {
        this.getUsers(1, value);
      }
    }
  },
  methods: {
    registred(user) {
      const registrationDate = new Date(user.registredAt);
      return `${registrationDate.toLocaleDateString()} | ${registrationDate.toLocaleTimeString()}`;
    },
    async getUsers(page, search) {
      try {
        this.isLoading = true;
        const responseObj = await this.$store.dispatch("getAllUsers", {
          page,
          search: search ? search : ""
        });
        this.users = responseObj.users;
        this.currPage = responseObj.currentPage;
        this.nextPage = responseObj.nextPage;
        this.prevPage = responseObj.prevPage;
        this.totalPages = responseObj.totalPages;
      } catch (error) {
        console.log(error);
      }
      this.isLoading = false;
    },
    prev() {
      if (this.prevPage > 0) {
        this.getUsers(this.prevPage, this.searchResult);
      }
    },
    next() {
      if (this.nextPage > 0) {
        this.getUsers(this.nextPage, this.searchResult);
      }
    }
  }
};
</script>

<style lang="css">
.mt-200 {
  margin: 200px auto;
}
li.page-item {
  margin: 0;
}
.userlink {
  display: inline;
}
.userlink:hover {
  text-decoration: none;
}
span.online-dot {
  height: 10px;
  width: 10px;
  background-color: rgb(3, 190, 3);
  border-radius: 50%;
  display: inline-block;
}
span.offline-dot {
  height: 10px;
  width: 10px;
  background-color: rgb(255, 0, 0);
  border-radius: 50%;
  display: inline-block;
}
.u-table table {
  border: 1px solid #ddd;
}
.u-table table,
td,
th {
  font-size: 13.5pt;
  text-align: center;
  width: 150px;
  max-width: 200px;
  color: #ddd;
}
.u-table th,
td {
  padding: 20px;
}
td a {
  display: block;
  color: white;
  text-decoration: none;
}
td a:hover {
  color: rgb(214, 214, 214);
}
.result {
  color: rgb(167, 167, 167);
  font-size: 10pt;
}
.notfound {
  font-size: 13pt;
  margin: auto;
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