export const API_CONFIG = {
    BASE_URL: 'http://ravenapp.ru', // базовый url для запроса
    AUTHENTICATION: {
        REGISTRATION: '/api/auth/register',
        AUTHORIZATION: '/api/auth/login',
        LOGOUT: '/api/auth/logout'
    },
    CHATS: {
        GETUSERCHATS: '/api/chats',
    },
    USERS: {
        GETALLUSERS: '/api/users/list/search/user'
    },
    PROFILE: {
        GETPROFILE: '/api/users/' // userid
    }
};