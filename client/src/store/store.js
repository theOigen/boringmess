import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);
// axios.defaults.baseURL = 'https://boringmess.herokuapp.com/';
axios.defaults.baseURL = 'http://localhost:3000';

function setLastAndChangePos(state, { chatID, content, created }, type) {
    const chatInd = state.chats.findIndex(ch => ch._id === chatID);
    if (chatInd < 0) {
        return;
    }
    const chat = state.chats[chatInd];
    if (chat.lastMessage !== content || !chat.lastMessage.length) {
        if (content !== undefined) {
            chat.lastMessage = content.length ? content : 'Media File';
        } else {
            chat.lastMessage = '';
        }
        chat.lastUpdate = created ? created : chat.created;
        sort(state);
    }
}

function sort(state) {
    state.chats.sort((a, b) => {
        return new Date(b.lastUpdate) - new Date(a.lastUpdate);
    });
}

const moduleChats = {
    state: {
        chats: [],
        choosenChat: {},
        messages: [],
        filter: 'all',
        anyChatChoosen: false
    },
    getters: {
        chats(state) {
            return state.chats;
        },
        filter(state) {
            return state.filter;
        },
        chatHistory(state) {
            if (state.filter === 'all')
                return state.messages;
            else
                return state.messages.filter(message => message.attachment !== null);
        },
        isAnyChatChoosen(state) {
            return state.anyChatChoosen;
        },
        choosenChat(state) {
            return state.choosenChat;
        },
        choosenChatIndex(state) {
            return state.chats.findIndex(chat => chat._id === state.choosenChat._id);
        },
        chatById(state) {
            return id => state.chats.find(chat => chat._id === id);
        }
    },
    mutations: {
        destroyToken(state) {
            state.chats = [];
            state.choosenChat = {};
            state.messages = [];
            state.filter = 'all';
            state.anyChatChoosen = false;
        },
        changeFilter(state, filter) {
            state.filter = filter;
        },
        retrieveChats(state, { chats, have }) {
            if (chats.length > 0) {
                state.chats = state.chats.concat(chats);
            }
        },
        chooseChat(state, chat) {
            state.choosenChat = chat;
            state.messages = [];
            state.anyChatChoosen = true;
        },
        retrieveChatHistory(state, data) {
            if (data.have === 0) {
                state.messages = data.messages;
            } else {
                state.messages = data.messages.concat(state.messages);
            }
        },
        sendNewMessage(state, newMessage) {
            state.messages.push(newMessage);
            setLastAndChangePos(state, {
                chatID: newMessage.chat,
                content: newMessage.content,
                created: newMessage.created
            }, 'new');
        },
        deleteMessage(state, data) {
            const toDeleteInd = state.messages.findIndex(msg => msg._id === data.deletedMessage._id);
            state.messages.splice(toDeleteInd, 1);
            if (data.lastMessage) {
                setLastAndChangePos(state, {
                    chatID: data.lastMessage.chat,
                    content: data.lastMessage.content,
                    created: data.lastMessage.created
                }, 'delete');
            } else {
                setLastAndChangePos(state, {
                    chatID: data.deletedMessage.chat,
                    content: undefined,
                    created: ''
                }, 'delete');
            }
        },
        deleteChat(state, chat) {
            state.chats.splice(state.chats.findIndex(ch => ch._id === chat._id), 1);
            if (state.choosenChat._id === chat._id) {
                state.choosenChat = {};
                state.messages = [];
                state.anyChatChoosen = false;
            }
        },
        createChat(state, chat) {
            state.chats.unshift(chat);
        },
        updateChat(state, chat) {
            const index = state.chats.findIndex(ch => ch._id.toString() === chat._id.toString());
            if (index >= 0) {
                chat.lastMessage = state.chats[index].lastMessage;
                state.chats[index] = chat;
                if (state.anyChatChoosen && state.choosenChat._id.toString() === chat._id.toString()) {
                    state.choosenChat = chat;
                }
                sort(state);
            }
        },
        SOCKET_newMessage(state, message) {
            if (state.anyChatChoosen && state.choosenChat._id === message.chat) {
                state.messages.push(message);
            }
            setLastAndChangePos(state, {
                chatID: message.chat,
                content: message.content,
                created: message.created
            }, 'new');
        },
        SOCKET_deleteMessage(state, data) {
            if (state.anyChatChoosen && state.choosenChat._id === data.deletedMessage.chat) {
                const toDeleteInd = state.messages.findIndex(msg => msg._id === data.deletedMessage._id);
                state.messages.splice(toDeleteInd, 1);
            }
            if (data.lastMessage) {
                setLastAndChangePos(state, {
                    chatID: data.lastMessage.chat,
                    content: data.lastMessage.content,
                    created: data.lastMessage.created
                }, 'delete');
            } else {
                setLastAndChangePos(state, {
                    chatID: data.deletedMessage.chat,
                    content: undefined,
                    created: ''
                }, 'delete');
            }
        }
    },
    actions: {
        SOCKET_newMessage(context, message) {
            context.commit("SOCKET_newMessage", message);
        },
        SOCKET_deleteMessage(context, data) {
            context.commit("SOCKET_deleteMessage", data);
            if (context.state.anyChatChoosen && context.state.messages.length < 5) {
                context.dispatch("retrieveChatHistory", { id: context.state.choosenChat._id, have: context.state.messages.length });
            }
        },
        SOCKET_joinChat(context, chat) {
            context.commit("createChat", chat);
        },
        SOCKET_leaveChat(context, chatID) {
            const chat = context.getters.chatById(chatID);
            if (chat) {
                context.commit('deleteChat', chat);
                if (context.getters.chats.length < 8) {
                    context.dispatch("retrieveChats", context.getters.chats.length)
                        .catch(error => {
                            console.log(error);
                        });
                }
            }
        },
        SOCKET_updateChat(context, chat) {
            context.commit("updateChat", chat);
        },
        getChatById(context, { id, mutation }) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.rootState.token;
            if (context.rootGetters.isLoggedIn) {
                return new Promise((resolve, reject) => {
                    axios.get(`/api/v2/chats/${id}`)
                        .then(response => {
                            if (mutation === "add") {
                                context.commit("createChat", response.data.chat);
                            }
                            resolve(response.data);
                        })
                        .catch(error => {
                            reject(error.response.data.error);
                        });
                });
            }
        },
        createChat(context, formData) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.rootState.token;
            if (context.rootGetters.isLoggedIn) {
                return new Promise((resolve, reject) => {
                    axios.post('/api/v2/chats', formData)
                        .then(response => {
                            context.commit('createChat', response.data);
                            resolve(response.data);
                        })
                        .catch(error => {
                            reject(error.response.data.error);
                            console.log(error);
                        });
                });
            }
        },
        updateChat(context, { chatId, formData }) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.rootState.token;
            axios.defaults.headers.common['Content-Type'] = 'multipart/form-data';
            if (context.getters.isLoggedIn) {
                return new Promise((resolve, reject) => {
                    axios.put(`/api/v2/chats/${chatId}`, formData)
                        .then(response => {
                            const chat = response.data.updatedChat;
                            context.commit('updateChat', chat);
                            resolve(chat);
                        })
                        .catch(error => {
                            reject(error.response.data.error);
                        });
                });
            }
        },
        isChatExist(context, shareName) {
            return new Promise((resolve, reject) => {
                axios.get(`/api/v2/chats/exist/${shareName}`)
                    .then(response => {
                        const isExist = response.data.exist;
                        resolve(isExist);
                    })
                    .catch(error => {
                        console.log(error);
                        reject(error.response.data.error);
                    });
            });
        },
        changeFilter(context) {
            if (context.state.filter === 'all')
                context.commit('changeFilter', 'sharedMedia');
            else
                context.commit('changeFilter', 'all');
        },
        retrieveChats(context, have) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.rootState.token;
            if (context.rootGetters.isLoggedIn) {
                have = have ? have : 0;
                return new Promise((resolve, reject) => {
                    axios.get(`/api/v2/chats?have=${have}`)
                        .then(response => {
                            context.commit('retrieveChats', {
                                chats: response.data.chats,
                                have: response.data.have
                            });
                            resolve(response.data.have);
                        })
                        .catch(error => {
                            reject(error.response.data.error);
                        });
                });
            }
        },
        chooseChat(context, chat) {
            context.commit('chooseChat', chat);
        },
        retrieveChatHistory(context, { id, have }) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.rootState.token;
            if (context.rootGetters.isLoggedIn && context.state.filter === 'all') {
                return new Promise((resolve, reject) => {
                    axios.get(`/api/v2/chats/${context.state.choosenChat._id}/history?have=${have}`)
                        .then(response => {
                            if (response.data.messages.length !== 0) {
                                context.commit('retrieveChatHistory', response.data);
                                resolve('complete');
                            }
                        })
                        .catch(error => {
                            console.log(error);
                        });
                });
            }
        },
        sendNewMessage(context, formData) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.rootState.token;
            axios.defaults.headers.common['Content-Type'] = 'multipart/form-data';
            if (context.rootGetters.isLoggedIn) {
                return new Promise((resolve, reject) => {
                    axios.post('/api/v2/messages', formData)
                        .then(response => {
                            context.commit('sendNewMessage', response.data);
                            resolve(response.data);
                        })
                        .catch(error => {
                            console.log(error);
                            reject(error.response.data.error);
                        });
                });
            }
        },
        deleteMessage(context, msg) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.rootState.token;
            if (context.rootGetters.isLoggedIn) {
                return new Promise((resolve, reject) => {
                    axios.delete(`/api/v2/messages/${msg._id}`)
                        .then(response => {
                            context.commit('deleteMessage', response.data);
                            if (context.state.anyChatChoosen && context.state.messages.length < 5) {
                                context.dispatch("retrieveChatHistory", { id: context.state.choosenChat._id, have: context.state.messages.length });
                            }
                            resolve(response.data);
                        })
                        .catch(error => {
                            console.log(error);
                            reject(error.response.data.error);
                        });
                });
            }
        },
        deleteChat(context, chat) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.rootState.token;
            if (context.rootGetters.isLoggedIn) {
                return new Promise((resolve, reject) => {
                    axios.delete(`/api/v2/chats/${chat._id}`)
                        .then(response => {
                            context.commit('deleteChat', chat);
                            const proms = [];
                            proms.push(response);
                            if (context.getters.chats.length < 8) {
                                proms.push(context.dispatch("retrieveChats", context.getters.chats.length));
                            }
                            return Promise.all(proms);
                        })
                        .then(([response, retrResp]) => {
                            resolve(response.data);
                        })
                        .catch(error => {
                            reject(error);
                            console.log(error);
                        });
                });
            }
        }
    }
};

export const store = new Vuex.Store({
    modules: {
        chatStore: moduleChats
    },
    state: {
        status: '',
        token: localStorage.getItem('jwt') || null,
        user: {}
    },
    getters: {
        isLoggedIn: state => state.token !== null,
        authStatus: state => state.status,
        isAdmin: state => state.user.role ? state.user.role : false,
        me: state => state.user
    },
    mutations: {
        retrieveToken(state, { user, token }) {
            state.user = user;
            state.token = token;
        },
        destroyToken(state) {
            state.token = null;
            state.user = {};
        },
        updateUser(state, { user, newToken }) {
            state.user = user;
            state.token = newToken;
        },
        getLoggedUser(state, user) {
            state.user = user;
        }
    },
    actions: {
        getLoggedUser(context) {
            if (context.getters.isLoggedIn) {
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.state.token;
                return new Promise((resolve, reject) => {
                    axios.get('/api/v2/me')
                        .then(response => {
                            const user = response.data.user;
                            context.commit('getLoggedUser', user);
                            resolve(user._id.toString());
                        })
                        .catch(error => {
                            console.log(error);
                            reject(error.response.data.error);
                        });
                });
            }
        },
        register(context, data) {
            return new Promise((resolve, reject) => {
                axios.post('/auth/register', {
                    username: data.username,
                    fullname: data.fullname,
                    password: data.password,
                    password_2: data.password_2
                })
                    .then(response => {
                        const token = response.data.token;
                        const user = response.data.user;
                        localStorage.setItem('jwt', token);
                        context.commit('retrieveToken', { user, token });
                        resolve(response.data.user);
                    })
                    .catch(error => {
                        reject(error.response.data.error);
                    });
            });
        },
        retrieveToken(context, credentials) {
            return new Promise((resolve, reject) => {
                axios.post('/auth/login', {
                    username: credentials.username,
                    password: credentials.password
                })
                    .then(response => {
                        const token = response.data.token;
                        const user = response.data.user;
                        localStorage.setItem('jwt', token);
                        context.commit('retrieveToken', { user, token });
                        context.dispatch("retrieveChats");
                        resolve(response.data.user);
                    })
                    .catch(error => {
                        console.log(error);
                        reject(error);
                    });
            });
        },
        isUsernameExist(context, username) {
            return new Promise((resolve, reject) => {
                axios.get(`/api/v2/users/exist/${username}`)
                    .then(response => {
                        const isExist = response.data.exist;
                        resolve(isExist);
                    })
                    .catch(error => {
                        reject(error.response.data.error);
                    });
            });
        },
        updateUser(context, { userId, formData }) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.state.token;
            axios.defaults.headers.common['Content-Type'] = 'multipart/form-data';
            if (context.getters.isLoggedIn) {
                return new Promise((resolve, reject) => {
                    axios.put(`/api/v2/users/${userId}`, formData)
                        .then(response => {
                            const user = response.data.updatedUser;
                            const newToken = response.data.newToken;
                            if (user._id === context.state.user._id) {
                                context.commit('updateUser', { user, newToken });
                                localStorage.setItem('jwt', newToken);
                            }
                            resolve(user);
                        })
                        .catch(error => {
                            reject(error.response.data.error);
                        });
                });
            }
        },
        getAllUsers(context, { page, search }) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.state.token;
            if (context.getters.isLoggedIn) {
                return new Promise((resolve, reject) => {
                    axios.get(`/api/v2/users?page=${page}&search=${search}`)
                        .then(response => {
                            resolve(response.data);
                        })
                        .catch(error => {
                            reject(error.response.data.error);
                        });
                });
            }
        },
        getUserByID(context, userID) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.state.token;
            if (context.getters.isLoggedIn) {
                return new Promise((resolve, reject) => {
                    axios.get(`/api/v2/users/${userID}`)
                        .then(response => {
                            const user = response.data.user;
                            resolve(user);
                        })
                        .catch(error => {
                            reject(error.response.data.error);
                        });
                });
            }
        },
        destroyToken(context) {
            axios.defaults.headers.common['Authorization'] = 'Bearer ' + context.state.token;
            if (context.getters.isLoggedIn) {
                return new Promise((resolve, reject) => {
                    axios.post('/auth/logout')
                        .then(response => {
                            localStorage.removeItem('jwt');
                            context.commit('destroyToken');
                            resolve(response);
                        })
                        .catch(error => {
                            localStorage.removeItem('jwt');
                            reject(error.response.data.error);
                        });
                });
            }
        }
    },
});