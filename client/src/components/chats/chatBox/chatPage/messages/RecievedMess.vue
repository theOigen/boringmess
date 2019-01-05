<template>
  <div class="receivedMess">
    <div class="messImg">
      <router-link
        :to="{ name: 'profile', params: { usr: message.author, id: message.author._id } }"
      >
        <img class="chatPreviewPic" :src="message.author.avaUrl" alt="user ava">
      </router-link>
    </div>
    <div class="messContent">
      <div class="author">@{{message.author.login}}</div>
      <div v-if="message.attachment">
        <img
          v-if="message.attachment.fileType === 'image'"
          class="chatPic"
          :src="message.attachment.mediaUrl"
        >
        <audio v-else-if="message.attachment.fileType === 'audio'" controls>
          <source :src="message.attachment.mediaUrl">Your browser does not support the audio tag.
        </audio>
        <video
          v-else-if="message.attachment.fileType === 'video'"
          width="250"
          height="220"
          controls
        >
          <source :src="message.attachment.mediaUrl">Your browser does not support the video tag.
        </video>
        <embed v-else-if="message.attachment.fileType === 'raw'" :src="message.attachment.mediaUrl">
        <br>
      </div>
      <p id="mcont">{{message.content}}</p>
      <span class="timeDate">
        <span>{{dateCreation}}</span>
        <span v-if="isChatOwner">|
          <form style="display:inline;">
            <button
              type="button"
              class="btn deleteMessBtn btn-sm"
              :value="message._id"
              data-toggle="modal"
              data-target="#delMessageWindow"
              @click="deleteMess"
            >
              <i class="fa fa-remove" aria-hidden="true"></i>
            </button>
          </form>
        </span>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    msg: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    isChatOwner: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      message: {}
    };
  },
  created() {
    this.message = this.msg;
  },
  methods: {
    deleteMess() {
      eventBus.$emit("msgToDelete", this.message);
    }
  },
  computed: {
    dateCreation() {
      const messDate = new Date(this.message.created);
      const month = messDate.toLocaleString("en-us", { month: "short" });
      const sentDate = `${messDate.getHours()}:${messDate.getMinutes()} | ${month} ${messDate.getDate()}`;
      return sentDate;
    }
  }
};
</script>

<style>
</style>
