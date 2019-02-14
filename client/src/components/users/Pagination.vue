<template id="pagination-template">
  <div class="pagination_2">
    <div class="center_2">
      <a href="#" v-if="hasPrev()" @click.prevent="changePage(prevPage)">Prev</a>
      <span v-if="hasFirst()">
        <a href="#" @click.prevent="changePage(1)">1</a>
      </span>
      <a v-if="hasFirstDots()">...</a>
      <span v-for="page in pages" :key="page">
        <a
          v-if="page == current"
          class="active"
          :style="activeStyle"
          href="#"
          @click.prevent="changePage(page)"
        >{{ page }}</a>
        <a v-else href="#" @click.prevent="changePage(page)">{{ page }}</a>
      </span>
      <a v-if="hasLastDots()">...</a>
      <span v-if="hasLast()">
        <a href="#" @click.prevent="changePage(total)">{{ total }}</a>
      </span>
      
      <a href="#" v-if="hasNext()" @click.prevent="changePage(nextPage)">Next</a>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    current: {
      type: Number,
      default: 1
    },
    total: {
      type: Number,
      default: 0
    },
    pageRange: {
      type: Number,
      default: 3
    },
    activeColor: {
      type: String,
      default: "#007DFF"
    },
    activeFontColor: {
      type: String,
      default: "white"
    }
  },
  computed: {
    pages() {
      const pages = [];
      for (let i = this.rangeStart; i <= this.rangeEnd; i++) {
        pages.push(i);
      }
      return pages;
    },
    rangeStart() {
      const start = this.current - this.pageRange;
      if (start > 0) {
        return start;
      } else {
        return 1;
      }
    },
    rangeEnd() {
      const end = this.current + this.pageRange;
      return end < this.total ? end : this.total;
    },
    nextPage() {
      return this.current + 1;
    },
    prevPage() {
      return this.current - 1;
    },
    activeStyle() {
      return {
        color: this.activeFontColor,
        backgroundColor: this.activeColor
      };
    }
  },
  methods: {
    hasFirst() {
      return this.rangeStart !== 1;
    },
    hasLast() {
      return this.rangeEnd < this.total;
    },
    hasFirstDots() {
      if (this.rangeStart <= 2) {
        return false;
      } else {
        return true;
      }
    },
    hasLastDots() {
      if (this.rangeEnd >= this.total - 1) {
        return false;
      } else {
        return true;
      }
    },
    hasPrev() {
      return this.current > 1;
    },
    hasNext() {
      return this.current < this.total;
    },
    changePage(page) {
      this.$emit("page-changed", page);
    }
  }
};
</script>

<style>
.pagination_2 {
  margin-top: 20px;
}
.pagination_2 a {
  color: black;
  float: left;
  padding: 8px 16px;
  text-decoration: none;
  transition: background-color 0.3s;
  border: 1px solid #ddd;
}
.pagination_2 a:hover {
  background: #ddd;
}
.center_2 {
  display: flex;
  justify-content: center;
}
</style>