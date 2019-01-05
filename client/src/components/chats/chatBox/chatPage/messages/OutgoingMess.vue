<template>
  <div class="outgoingMess">
    <div class="box sb4">
      <div v-if="message.attachment">
        <img
          v-if="message.attachment.fileType === 'image'"
          class="chatPic"
          :src="message.attachment.mediaUrl"
        >
        <audio class="msgaudio" v-else-if="message.attachment.fileType === 'audio'" controls>
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
        <span>{{dateCreation}}</span> |
        <form style="display:inline;">
          <button
            class="btn deleteMessBtn btn-sm"
            :value="message._id"
            type="button"
            data-toggle="modal"
            data-target="#delMessageWindow"
            @click="deleteMess"
          >
            <i class="fa fa-remove" aria-hidden="true"></i>
          </button>
        </form>
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
.editMessBtn {
  padding: 1px;
  margin-bottom: 2px;
  color: #1e2125;
  background: none;
  border: none;
}
.outgoingMess {
  padding: 0 0 0 10px;
  vertical-align: top;
  width: 92%;
  margin-bottom: 12px;
  float: right;
}
.outgoingMess img {
  max-height: 100%;
  max-width: 100%;
}
.outgoingMess video {
  max-height: 100%;
  max-width: 100%;
}
.box {
  width: 53%;
  color: #fff;
  position: relative;
  font-size: 14px;
  background: #4392ec none repeat scroll 0 0;
  border-radius: 3px;
  padding: 10px 10px 5px 12px;
  float: right;
}
.box.sb4 p {
  margin: 0;
  font-size: 14px;
  color: #fff;
  width: 100%;
  overflow-wrap: break-word;
}
.sb4:before {
  content: "";
  width: 0px;
  height: 0px;
  position: absolute;
  border-left: 9px solid transparent;
  border-right: 9px solid #4392ec;
  border-top: 9px solid #4392ec;
  border-bottom: 9px solid transparent;
  right: 19px;
  bottom: -11px;
}
</style>

