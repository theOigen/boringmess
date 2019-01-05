import Home from './components/Home';
import Users from './components/users/Users';
import Profile from './components/users/Profile';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Logout from './components/auth/Logout';
import Chats from './components/chats/chatBox/chatsList/Chats';
import NewChat from './components/chats/NewChat';
import ChatProfile from './components/chats/ChatProfile';
import NotFound from './components/errors/404';
import About from './components/About';
import API from './components/API';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/users',
    name: 'users',
    component: Users,
    meta: {
      requiresAuth: true,
    }
  },
  {
    path: '/users/:id',
    name: 'profile',
    component: Profile,
    meta: {
      requiresAuth: true
    },
    props: true
  },
  {
    path: '/chats',
    name: 'chats',
    component: Chats,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/chats/new',
    name: 'chats_new',
    component: NewChat,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/chats/:id',
    name: 'chatProfile',
    component: ChatProfile,
    meta: {
      requiresAuth: true
    },
    props: true
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: {
      requiresVisitor: true
    }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      requiresVisitor: true
    }
  },
  {
    path: '/logout',
    name: 'logout',
    component: Logout,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/about',
    name: 'about',
    component: About
  },
  {
    path: '/developer/v2',
    name: 'api',
    component: API
  },
  {
    path: '*',
    component: NotFound
  }
];
export default routes;