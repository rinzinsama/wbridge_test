
<template>
  <div class="q-pa-lg  row col-6">
    <div v-if="!username">
      <div class="text-h4">Enter your username:</div>
      <q-input filled dense type="text" v-model="inputUsername" @keyup.enter="submitUsername" />
      <q-btn color="primary" class="q-mt-xs" @click="submitUsername" size="sm" label="Submit" />
      <p v-if="usernameTaken">Username is already taken.</p>
    </div>
    <div v-else>
      <div class="text-h4 text-center">Welcome, {{ username }}!</div>
      <div class="q-pa-md row justify-center">
        <div class="text-h5">Chat History</div>

        <!-- <div style="width: 100%; max-width: 400px">
          <div v-for="message in messages" :key="message._id">
            <q-chat-message v-if="message.type === 'newMessage'" :name="message.username" :text="[message.message]" />
            <div v-if="message.type !== 'newMessage'" class="text-primary text-subtitle">{{ message.message }}</div>
          </div>
        </div> -->

        <div style="width: 100%; max-width: 400px">
          <div v-for="message in messages" :key="message._id" class="message-item">
            <q-chat-message v-if="message.type === 'newMessage'" :name="message.username" :text="[message.message]" />
            <div v-else-if="!message.editing" class="text-primary text-subtitle text-center">{{ message.message }}</div>
            <div v-else>
              <q-input filled type="text" v-model="message.editText" @keyup.enter="saveMessage(message)"
                @blur="cancelEdit(message)" />
              <q-btn dense flat icon="check" @click="saveMessage(message)" />
              <q-btn dense flat icon="close" @click="cancelEdit(message)" />
            </div>
            <div v-if="message.showMenu" class="three-dot-menu">
              <q-menu>
                <q-item clickable v-on:click="editMessage(message)">
                  <q-item-section>Update</q-item-section>
                </q-item>
                <q-item clickable v-on:click="deleteMessage(message)">
                  <q-item-section>Delete</q-item-section>
                </q-item>
              </q-menu>
            </div>
            <div v-else class="three-dot-icon" @click="toggleMenu(message)">
              <i class="fas fa-ellipsis-v"></i>
            </div>
          </div>
        </div>



      </div>

      <div>
        <q-input filled bottom-slots v-model="inputMessage" dense @keyup.enter="submitMessage">
          <template v-slot:after>
            <q-btn round dense flat icon="send" @click="submitMessage" />
          </template>
        </q-input>
        <!-- <q-input filled dense type="text" v-model="inputMessage" @keyup.enter="submitMessage" /> -->
        <!-- <q-btn @click="submitMessage" icon="send" /> -->
      </div>
    </div>
  </div>
</template>


<script>
import io from 'socket.io-client';

export default {
  data() {
    return {
      socket: null,
      username: '',
      inputUsername: '',
      inputMessage: '',
      messages: [],
      editingMessage: null,
      usernameTaken: false,
    };
  },
  mounted() {
    this.socket = io('/');

    // Prompt user for username
    this.socket.on('requestUsername', () => {
      this.username = '';
    });

    // Username is already taken
    this.socket.on('usernameTaken', () => {
      this.usernameTaken = true;
    });

    // User joined
    this.socket.on('userJoined', (username) => {
      this.addMessage(username, `${username} has joined the chat.`, "userJoined");
    });

    // New message
    this.socket.on('newMessage', ({ username, message }) => {
      this.addMessage(username, message, "newMessage");
    });

    // User left
    this.socket.on('userLeft', (username) => {
      this.addMessage(username, `${username} has left the chat.`, "userLeft");
    });

    this.socket.on('fetchedMessages', (messages) => {
      this.messages = messages;
    });


  },
  methods: {
    submitUsername() {
      if (this.inputUsername.trim()) {
        this.username = this.inputUsername;
        this.socket.emit('submitUsername', this.username);
        this.inputUsername = '';
        this.usernameTaken = false;
      }
    },
    submitMessage() {
      if (this.inputMessage.trim()) {
        this.socket.emit('submitMessage', this.inputMessage);
        this.inputMessage = '';
      }
    },
    addMessage(username, message, type) {
      this.messages.push({ id: Date.now(), message, username: username, type: type });
    },
    editMessage(message) {
      this.editingMessage = message;
      message.editing = true;
      message.editText = message.message;
      message.showMenu = false; // Hide the menu after clicking "Update"
    },

    saveMessage(message) {
      if (message.editText.trim()) {
        message.message = message.editText;
        message.editing = false;
        this.socket.emit('editMessage', { messageId: message._id, message: message.message });
      }
    },

    cancelEdit(message) {
      message.editing = false;
    },

    deleteMessage(message) {
      const index = this.messages.indexOf(message);
      if (index > -1) {
        this.messages.splice(index, 1);
        this.socket.emit('deleteMessage', message._id);
      }
    },

    toggleMenu(message) {
      message.showMenu = !message.showMenu;
    },
  },
};
</script>
